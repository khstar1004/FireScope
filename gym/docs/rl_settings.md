# RL 세팅 요약

이 문서는 현재 레포에서 사용하는 강화학습 환경과 기본 학습 설정을 한 번에 정리한 문서입니다.

## 1. 사용 중인 환경

실제 RL 학습은 `blade/FixedTargetStrike-v0`를 기준으로 돌아갑니다. 등록은 [`gym/blade/__init__.py`](../blade/__init__.py)에서 되어 있고, 학습 스크립트도 이 환경을 직접 생성합니다.

- 환경 ID: `blade/FixedTargetStrike-v0`
- 환경 클래스: [`gym/blade/envs/fixed_target_strike.py`](../blade/envs/fixed_target_strike.py)의 `FixedTargetStrikeEnv`
- 기본 시나리오: [`gym/scripts/fixed_target_strike/scen.json`](../scripts/fixed_target_strike/scen.json)
- 기본 컨트롤 아군: `blue-striker-1`, `blue-striker-2`
- 기본 적 타겟: `red-sam-site`, `red-airbase`
- 기본 진영: `BLUE` vs `RED`

`blade/BLADE-v0`도 등록되어 있지만, 현재 RL training path는 fixed-target strike 전용 환경을 사용합니다.

## 2. 관측값

환경은 `Dict[str, np.ndarray]`를 반환합니다.

- `allies`: `(max_allies, 10)`
- `targets`: `(max_targets, 8)`
- `launch_eta`: `(max_allies, max_targets)`
- `impact_eta`: `(max_allies, max_targets)`
- `range_margin`: `(max_allies, max_targets)`
- `threat_exposure`: `(max_allies, max_targets)`
- `weapon_range_advantage`: `(max_allies, max_targets)`
- `ally_mask`: `(max_allies,)`
- `target_mask`: `(max_targets,)`
- `global`: `(8,)`

관측값의 실제 생성 로직은 [`FixedTargetStrikeEnv._build_observation`](../blade/envs/fixed_target_strike.py)에서 관리합니다.

이번 버전에서는 ally-target pair 관계를 더 직접적으로 표현하기 위해 `range_margin`, `threat_exposure`, `weapon_range_advantage`를 추가했고, ally의 threat feature도 binary 대신 연속값으로 바뀌었습니다. 이 변경 때문에 예전 observation 버전으로 학습된 체크포인트는 그대로 재사용할 수 없습니다.

## 3. 행동값

행동 공간은 flat `Box(0.0, 1.0, shape=(max_allies * (max_targets + 3),))`입니다.

각 ally는 자기 전용 action block을 가집니다.

- 앞 `max_targets` 값: target priority logits
- 뒤 3개 값: `[mode, radius, bearing]`
- `mode < 1/3`: hold
- `1/3 <= mode < 2/3`: 목표 주변으로 reposition
- `mode >= 2/3`: 사정거리 안이면 fire, 아니면 reposition fallback

행동 해석은 [`FixedTargetStrikeEnv._apply_actions`](../blade/envs/fixed_target_strike.py)와 [`FixedTargetStrikeEnv._try_fire`](../blade/envs/fixed_target_strike.py)에서 처리합니다.

## 4. 에피소드 종료 조건

종료 판정은 다음 기준으로 나뉩니다.

- `success`: 모든 target이 파괴됨
- `failure`: 남은 target에 대해 더 이상 공격 능력이 없음
- `truncated`: `max_episode_steps` 도달 또는 엔진 truncation

종료 사유 문자열은 `info["done_reason"]`와 `info["done_reason_detail"]`에 들어갑니다.

## 5. 보상

보상 함수는 [`gym/blade/envs/fixed_target_strike_reward.py`](../blade/envs/fixed_target_strike_reward.py)에서 제공되고, `StepContext`를 받아 reward와 breakdown을 반환합니다.

기본 보상 항목은 아래와 같습니다.

- `kill_reward`
- `tot_bonus`
- `eta_progress_bonus`
- `ready_to_fire_bonus`
- `stagnation_penalty`
- `target_switch_penalty`
- `threat_penalty`
- `launch_cost`
- `time_cost`
- `loss_cost`
- `terminal_bonus`

학습 스크립트의 기본 보상 파라미터는 [`gym/scripts/fixed_target_strike/train.py`](../scripts/fixed_target_strike/train.py)에서 설정합니다.

## 6. 학습 기본값

`gym/scripts/fixed_target_strike/train.py`와 Vite dev server plugin의 기본값은 거의 동일합니다.

- 지원 알고리즘: `ppo`, `a2c`, `sac`, `ddpg`, `td3`
- RL Lab 프리셋: `smoke`, `quick`, `standard`, `extended`, `curriculum`

- 알고리즘: `ppo`
- `timesteps`: `4096`
- `max_episode_steps`: `240`
- `eval_episodes`: `1`
- `eval_seed_count`: `3`
- `seed`: `7`
- `progress_eval_frequency`: `512`
- `progress_eval_episodes`: `1`
- `normalize_margin_nm`: `120.0`
- `eta_clip_seconds`: `1800.0`
- `threat_buffer_nm`: `5.0`

보상 기본값:

- `kill_base`: `100`
- `high_value_target_bonus`: `50`
- `tot_weight`: `40`
- `tot_tau_seconds`: `8`
- `eta_progress_weight`: `6`
- `ready_to_fire_bonus`: `2.5`
- `stagnation_penalty_per_assignment`: `-0.15`
- `target_switch_penalty`: `-0.3`
- `threat_step_penalty`: `-2`
- `launch_cost_per_weapon`: `-1`
- `time_cost_per_step`: `-0.05`
- `loss_penalty_per_ally`: `-80`
- `success_bonus`: `150`
- `failure_penalty`: `-150`

최종 평가는 multi-seed benchmark를 기본으로 사용하고, 아래 지표를 함께 기록합니다.

- `success_rate`
- `survivability`
- `weapon_efficiency`
- `time_to_ready`
- `tot_quality`

seed별 편차가 크면 요약 JSON과 RL Lab UI에 경고가 표시됩니다.

체크포인트는 observation/reward version 메타데이터를 함께 저장합니다. 현재 로드 정책은 `version mismatch면 차단`, `metadata가 없는 legacy 모델은 경고`입니다.

## 7. 실행 경로

로컬에서 직접 돌릴 때는 [`gym/scripts/fixed_target_strike/train.py`](../scripts/fixed_target_strike/train.py)를 사용합니다.

예시:

```bash
cd gym
python scripts/fixed_target_strike/train.py
```

커리큘럼 예시:

```bash
cd gym
python scripts/fixed_target_strike/train.py --curriculum-enabled --algorithms ppo sac td3
```

추천 기본 조합:

- `PPO`: 빠른 기준선 확보
- `SAC`: 안정적인 연속행동 기준선
- `TD3 / DDPG`: deterministic actor 비교 실험

클라이언트의 RL Lab은 [`client/scripts/createRlDevServerPlugin.ts`](../../client/scripts/createRlDevServerPlugin.ts)에서 같은 train script를 호출합니다.

## 8. 핵심 파일

- [`gym/blade/envs/fixed_target_strike.py`](../blade/envs/fixed_target_strike.py)
- [`gym/blade/envs/fixed_target_strike_types.py`](../blade/envs/fixed_target_strike_types.py)
- [`gym/blade/envs/fixed_target_strike_reward.py`](../blade/envs/fixed_target_strike_reward.py)
- [`gym/scripts/fixed_target_strike/train.py`](../scripts/fixed_target_strike/train.py)
- [`client/scripts/createRlDevServerPlugin.ts`](../../client/scripts/createRlDevServerPlugin.ts)
