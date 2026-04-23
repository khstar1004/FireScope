export const RL_LAB_HASH = "#/rl-lab";
export const RL_LAB_SCENARIO_KEY = "vista_rl_lab_scenario";
export const RL_PENDING_RECORDING_KEY = "vista_rl_pending_recording";
export const RL_PENDING_RECORDING_LABEL_KEY =
  "vista_rl_pending_recording_label";
export const RL_CHECKPOINT_SPECTATOR_KEY =
  "vista_rl_checkpoint_spectator";

export function isRlLabRoute(hash: string) {
  return hash.startsWith(RL_LAB_HASH);
}

export function getRlLabQueryParams(hash: string) {
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

export function buildRlLabHash(jobId?: string | null) {
  if (!jobId) {
    return RL_LAB_HASH;
  }
  const params = new URLSearchParams();
  params.set("jobId", jobId);
  return `${RL_LAB_HASH}?${params.toString()}`;
}
