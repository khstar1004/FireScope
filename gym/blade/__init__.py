from gymnasium.envs.registration import register

register(
    id="vista/VISTA-v0",
    entry_point="blade.envs:VISTA",
    max_episode_steps=2000,
)

register(
    id="vista/FixedTargetStrike-v0",
    entry_point="blade.envs:FixedTargetStrikeEnv",
)
