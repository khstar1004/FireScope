import {
  RL_LAB_HASH,
  buildRlLabHash,
  getRlLabQueryParams,
  isRlLabRoute,
} from "@/gui/rl/rlLabRoute";

describe("rl lab route helpers", () => {
  test("detects the RL Lab route and preserves job ids", () => {
    expect(isRlLabRoute(RL_LAB_HASH)).toBe(true);
    expect(isRlLabRoute(buildRlLabHash("job-123"))).toBe(true);
    expect(isRlLabRoute("#/flight-sim")).toBe(false);

    const params = getRlLabQueryParams(buildRlLabHash("job-123"));
    expect(params.get("jobId")).toBe("job-123");
  });
});

