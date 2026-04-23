## See [GitBook](https://docs.vista.com/gymnasium-environment) for more detailed docs

## Environment Table of Contents

- [VISTA](#vista)
- [RL Environment](#rl-environment)
- [FixedTargetStrike-v0](#fixedtargetstrike-v0)
- [Actions and Observations](#actions-and-observations)
  - [Observation](#observations)
  - [Actions](#actions)

<!-- /TOC -->

## VISTA

Visualized Intelligence for Situational Tactical Awareness (VISTA) is a warfare simulation with an OpenAI Gymnasium implementation. VISTA connects the Python simulation package with the TypeScript client experience for scenario editing, replay, briefing, and reinforcement-learning workflows.

The simulation currently runs in intervals of one second, but this can also be sped up (by skipping over several timesteps). Future milestones will probably revise this interval. In terms of features, VISTA currently simulates unit movement (using a simple model with constant fuel consumption for each unit), weapon engagement (using pre-defined lethality values), base operations (aircraft takeoff and landing), and simple NPC behaviors (units equipped with weapons will auto engage hostile units). VISTA also supports the creation of missions to automate NPC behaviors. Users can create patrol missions where units can patrol a pre-defined area, or a strike mission where units can transit to and strike a target. Future milestones will add sensor detection, more mission types, aerial refueling, logistics, more naval units, ground units, cyber operations, electronic warfare, and doctrine.

## RL Environment

RL 세팅을 한 번에 보고 싶으면 [`rl_settings.md`](./rl_settings.md)를 먼저 보시면 됩니다.

Refer to the [README](../README.md) for instructions on how to install the Gymnasium environment. Refer to [demo.py](../scripts/simple_demo/demo.py) for example usage. The demo features a scripted agent that uses the Gymnasium environment to control an aircraft to strike a target. To initialize a VISTA environment, the user must provide a scenario JSON file that defines the initial setup of the scenario. The easiest way to obtain this file is to use the VISTA client to build a scenario and export it to JSON format. Then, the VISTA environment can be run like any other Gymnasium environment. Observations at each timestep can be printed to the console using the environment's `pretty_print` function, and the entire scenario at a timestep can also be exported using `export_scenario`. The exported scenario can then be loaded back into the VISTA client for visualization.

## FixedTargetStrike-v0

`vista/FixedTargetStrike-v0` is a Dict-observation environment for coordinated fixed-target strike training. The reference fixture lives in `gym/scripts/fixed_target_strike/scen.json` and uses two controllable strike aircraft against one hostile SAM site plus one hostile airbase.

### Observation

The environment returns a `Dict[str, np.ndarray]` with these keys:

- `allies`: `(max_allies, 10)` float32 ally features for position, heading, fuel, remaining weapons, centroid distance, centroid bearing, in-range state, best launch ETA, and continuous threat exposure intensity.
- `targets`: `(max_targets, 8)` float32 target features for position, target type, threat radius, closest-ally distance, closest launch ETA, bearing from the ally centroid, and ally in-range fraction.
- `launch_eta`: `(max_allies, max_targets)` float32 launch ETA matrix.
- `impact_eta`: `(max_allies, max_targets)` float32 impact ETA matrix.
- `range_margin`: `(max_allies, max_targets)` float32 pair feature that directly encodes launch-envelope margin per ally-target pair.
- `threat_exposure`: `(max_allies, max_targets)` float32 pair feature that encodes continuous exposure intensity against each target threat radius.
- `weapon_range_advantage`: `(max_allies, max_targets)` float32 pair feature that compares the ally's best weapon range against the target threat radius.
- `ally_mask`: `(max_allies,)` float32 binary mask for live controllable aircraft slots.
- `target_mask`: `(max_targets,)` float32 binary mask for live hostile target slots.
- `global`: `(8,)` float32 summary features for episode progress, force counts, airborne weapons, mean launch ETA, mean threat exposure intensity, in-range pair fraction, and best launch ETA.

### Actions

The action space is a flat `Box(0.0, 1.0, shape=(max_allies * (max_targets + 3),))`.

- Each ally owns an independent action block.
- Within one ally block, the first `max_targets` values are target-priority logits. The highest live target slot becomes that ally's selected target.
- The last three values in the ally block are `[mode, radius, bearing]`.
- `mode < 1/3`: hold.
- `1/3 <= mode < 2/3`: reposition to a ring around that ally's selected target using the provided `radius` and `bearing`.
- `mode >= 2/3`: fire if the selected target is already inside the launch envelope. Otherwise the environment falls back to reposition using the same `radius` and `bearing`.

### Reward

The default reward breakdown is exposed through `info["reward_breakdown"]` with at least these keys:

- `kill_reward`: large positive reward for destroyed targets.
- `tot_bonus`: positive bonus when multiple launches on the same target have tightly synchronized impact times.
- `eta_progress_bonus`: positive shaping reward when selected assignments reduce launch ETA during the step.
- `ready_to_fire_bonus`: positive shaping reward when more selected allies become ready to launch.
- `stagnation_penalty`: negative shaping penalty when selected assignments stop improving launch ETA.
- `target_switch_penalty`: negative shaping penalty when living targets are switched too aggressively between steps.
- `threat_penalty`: per-step penalty for staying inside hostile threat envelopes.
- `launch_cost`: small negative cost per weapon fired.
- `time_cost`: small per-step negative cost to encourage faster completion.
- `loss_cost`: large penalty for losing friendly aircraft.
- `terminal_bonus`: positive on success and negative on failure.

Additional debug fields such as `weapons_fired`, `threat_exposure_count`, `selected_target_id`, `selected_target_ids`, `ally_target_assignments`, `stagnation_count`, `target_switch_count`, `tot_group_count`, and per-target `tot_groups` are also included to make rollout inspection easier.

Final model selection can aggregate multiple deterministic evaluation seeds through the training script so checkpoint comparisons are less sensitive to a single rollout. The evaluation summary now also reports `survivability`, `weapon_efficiency`, `time_to_ready`, `tot_quality`, and a seed-variability warning when per-seed spread is large.

The training script can optionally enable a curriculum schedule that starts from an easier scenario and gradually increases target count, threat radius, starting distance, and episode limit when stage success thresholds are met.

Observation and reward contracts are versioned. Current checkpoints store observation and reward version metadata, and version-mismatched models are blocked from loading by the training script.

For experiment automation, `gym/scripts/fixed_target_strike/compare_algorithms.py` wraps the same training path with standardized outputs: `comparison_summary.json`, `leaderboard.csv`, and `retained_models/retained_models.json`. The underlying training summary also includes a leaderboard, metric leaders, and retained-model manifest so the reinforcement-learning design UI and batch scripts can reuse the same comparison contract.

For regression testing, `gym/scripts/fixed_target_strike/benchmark_suite.py` can benchmark raw models or the outputs of those comparison artifacts across preset suites (`smoke`, `quick`, `standard`, `extended`). It records per-case evaluation summaries and can fail the run when metric thresholds or baseline-regression limits are violated.

The reference reward implementation intentionally does not use HP-style partial damage rewards.

Episode metadata is returned through `info["done_reason"]` and `info["done_reason_detail"]`. `done_reason` is the coarse category (`success`, `failure`, `truncated`, or `in_progress`) and `done_reason_detail` preserves the more specific cause such as `all_targets_destroyed`, `no_attack_capability`, or `max_episode_steps`.

### Example

```python
import gymnasium as gym
import blade
from blade.Game import Game
from blade.Scenario import Scenario
from blade.envs.fixed_target_strike_reward import FixedTargetStrikeRewardConfig
from blade.envs.fixed_target_strike_types import FixedTargetStrikeConfig

game = Game(current_scenario=Scenario())
with open("scripts/fixed_target_strike/scen.json", "r", encoding="utf-8") as scenario_file:
    game.load_scenario(scenario_file.read())

config = FixedTargetStrikeConfig(
    max_allies=2,
    max_targets=2,
    max_episode_steps=240,
    normalize_margin_nm=120.0,
    eta_clip_seconds=1800.0,
    threat_buffer_nm=5.0,
    reward_config=FixedTargetStrikeRewardConfig(high_value_target_ids=("red-airbase",)),
    controllable_side_name="BLUE",
    target_side_name="RED",
    ally_ids=["blue-striker-1", "blue-striker-2"],
    target_ids=["red-sam-site", "red-airbase"],
)

env = gym.make("vista/FixedTargetStrike-v0", game=game, config=config)
observation, info = env.reset()
```

## Actions and Observations

Given the complex nature of any warfare scenario, the base representations of the state and action spaces rely on Gymnasium's [Text space](https://gymnasium.farama.org/api/spaces/fundamental/#gymnasium.spaces.Text). Users interested in modifying these spaces to fit their scenario should refer to the environment definition at [blade.py](../blade/envs/blade.py).

### Observations

VISTA's state space is defined by the [Scenario](../blade/Scenario.py) class. This class contains parameters like the scenario's name, start time, duration, sides, current time, simulation speed (called time compression), aircraft, ships, facilities, airbases, weapons, reference points, and missions. Each of the objects starting from aircraft also have corresponding class definitions that define their attributes (reference [units](../blade/units)).

### Actions

VISTA's action space is defined by the functions provided by the [Game](../blade/Game.py) class that modifies the underlying simulation. The list of functions are:

```python
# adds a reference point
add_reference_point(reference_point_name: str, latitude: float, longitude: float) -> ReferencePoint

# removes a reference point
remove_reference_point(reference_point_id: str) -> None

# launches an aircraft from an airbase
launch_aircraft_from_airbase(airbase_id: str) -> Aircraft | None

# launches an aircraft from a ship
launch_aircraft_from_ship(ship_id: str) -> Aircraft | None

# creates a patrol mission where a list of aircraft patrols an area
create_patrol_mission(mission_name: str, assigned_units: list[str], assigned_area: list[list[float]]) -> None

# updates a patrol mission with new parameters
update_patrol_mission(mission_id: str, mission_name: str, assigned_units: list[str], assigned_area: list[list[float]]) -> None

# creates a strike mission where a list of attackers strike a list of targets
create_strike_mission(mission_name: str, assigned_attackers: list[str], assigned_targets: list[str]) -> None

# updates a strike mission with new parameters
update_strike_mission(mission_id: str, mission_name: str, assigned_attackers: list[str], assigned_targets: list[str]) -> None

# deletes a mission
delete_mission(mission_id: str) -> None

# assign a waypoint for an aircraft to reach
move_aircraft(aircraft_id: str, new_coordinates: list) -> Aircraft | None

# assign a waypoint for a ship to reach
move_ship(ship_id: str, new_coordinates: list) -> Ship | None

# launches a weapon from an aircraft to a target
handle_aircraft_attack(aircraft_id: str, target_id: str) -> None

# launches a weapon from a ship to a target
handle_ship_attack(ship_id: str, target_id: str) -> None

# directs an aircraft to return to its home base or the closest friendly base
aircraft_return_to_base(aircraft_id: str) -> Aircraft | None

# command the aircraft to land at its homebase, or if it does not have a homebase, land at the nearest base
land_aircraft(aircraft_id:str) -> None
```
