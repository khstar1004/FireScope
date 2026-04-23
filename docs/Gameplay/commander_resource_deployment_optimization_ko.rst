지휘관 자원·배치 최적화 시뮬레이션
====================================

개요
----

현재 VISTA의 강화학습 기능은 두 단계로 나눠서 보는 것이 맞습니다.

1. ``전술 실행 정책 학습``

   - 주어진 자산, 주어진 표적, 주어진 초기 배치에서
     가장 잘 싸우는 전술 행동정책을 학습합니다.
   - 현재 ``FixedTargetStrike-v0`` 경로가 여기에 해당합니다.

2. ``지휘관 자원·배치 최적화 시뮬레이션``

   - 지휘관이 사용할 수 있는 자원 풀을 주면,
     시스템이 자산 조합과 초기 배치를 바꿔가며
     승률이 높은 COA를 찾습니다.
   - 현재 구현은 ``gym/scripts/fixed_target_strike/commander_optimize.py`` 에 있습니다.


현재 구현 범위
--------------

이번 버전의 지휘관 최적화기는 다음을 실제로 탐색합니다.

- 어떤 아군 항공기 조합을 투입할지
- 적 표적군을 향한 초기 접근 거리
- 접근 축선 각도
- 편대 간 초기 간격
- 고가치 표적 우선순위

탐색된 각 후보안은 내부적으로 기존 전술 RL 학습기
``gym/scripts/fixed_target_strike/train.py`` 를 호출해서 평가합니다.

즉 구조는 다음과 같습니다.

- 외부 탐색기: 지휘관 자원·배치 최적화 시뮬레이션
- 내부 평가기: 전술 실행 정책 학습

클라이언트에서는 ``강화학습 설계`` 안에
``지휘관 자원·배치 최적화`` 패널이 추가되어
같은 시나리오와 표적 설정을 바로 넘겨 실행할 수 있습니다.


아직 포함되지 않은 것
--------------------

이번 버전은 아래 항목까지는 아직 자동 탐색하지 않습니다.

- 날씨, 시간대, 센서 품질 같은 환경 변수 자체의 최적화
- 지상군, 해상전력, 물자, 정비, 급유 자산의 다영역 동시 최적화
- 전자전, 기만, 사이버 효과의 탐색
- 실시간 opponent adaptation

따라서 현재 구현은 ``고정 표적 타격`` 문제를 대상으로 한
``지휘관 레벨 COA 탐색기`` 라고 보는 것이 정확합니다.


선정 기준
---------

지휘관 후보안 순위는 아래 순서로 정렬됩니다.

- ``success_rate``
- ``survivability``
- 더 짧은 ``time_to_ready``
- ``weapon_efficiency``
- ``mean_reward``
- 더 짧은 ``mean_episode_steps``

즉 보상 합계보다 ``실제 승률`` 과 ``생존성`` 을 먼저 봅니다.


실행 예시
---------

실제 평가 모드는 RL 의존성이 필요합니다.
없다면 먼저 아래처럼 설치해야 합니다.

.. code-block:: bash

   cd gym
   pip install -e .[gym]

드라이런으로 후보안만 생성하려면:

.. code-block:: bash

   cd gym
   python scripts/fixed_target_strike/commander_optimize.py --preset smoke --dry-run

빠른 탐색 예시:

.. code-block:: bash

   cd gym
   python scripts/fixed_target_strike/commander_optimize.py \
     --preset quick \
     --controllable-side-name BLUE \
     --target-side-name RED \
     --candidate-ally-ids blue-striker-1 blue-striker-2 \
     --target-ids red-sam-site red-airbase \
     --high-value-target-search-mode single

자원 조합 범위를 늘린 예시:

.. code-block:: bash

   cd gym
   python scripts/fixed_target_strike/commander_optimize.py \
     --preset standard \
     --min-allies 1 \
     --max-allies 3 \
     --max-resource-combinations 8 \
     --distance-scales 0.55 0.75 1.0 \
     --bearing-offsets-deg -60 -20 0 20 60 \
     --formation-spreads-nm 0 6 12


산출물
------

실행이 끝나면 ``gym/scripts/fixed_target_strike/commander_runs/<run-label>/`` 아래에
다음 산출물이 생성됩니다.

- ``commander_summary.json``: 전체 후보안, 순위표, 선정 결과
- ``commander_progress.json``: 실행 중 진행률, 현재 후보, 임시 leaderboard
- ``candidate-XXX/scenario.json``: 각 후보안의 변형 시나리오
- ``candidate-XXX/train_summary.json``: 각 후보안의 RL 학습 결과
- ``selected_candidate_model.zip``: 최종 선정 후보의 모델 사본
- ``selected_candidate_eval_scenario.json``: 최종 선정 후보의 평가 시나리오
- ``selected_candidate_eval_recording.jsonl``: 최종 선정 후보의 리플레이


의미
----

이 기능은 ``지휘관이 자원과 배치를 어떻게 잡아야 이길 확률이 높은가`` 를 찾는
작전 레벨 시뮬레이션입니다.

반대로 ``주어진 배치에서 실제로 어떻게 싸울 것인가`` 는
기존 ``전술 실행 정책 학습`` 이 담당합니다.

이 둘을 같이 써야 지휘와 전술이 분리된 강화학습 체계가 됩니다.
