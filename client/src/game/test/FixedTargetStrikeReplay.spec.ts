import RecordingPlayer from "@/game/playback/RecordingPlayer";
import { fixedTargetStrikeRlDemo } from "@/scenarios/fixedTargetStrikeRlDemo";

describe("fixed target strike replay bundle", () => {
  test("loads the bundled RL replay and matches the metric timeline", () => {
    const recordingPlayer = new RecordingPlayer();

    expect(recordingPlayer.loadRecording(fixedTargetStrikeRlDemo.recording)).toBe(
      true
    );
    expect(recordingPlayer.hasRecording()).toBe(true);
    expect(recordingPlayer.getEndStepIndex() + 1).toBe(
      fixedTargetStrikeRlDemo.metrics.length
    );
    expect(fixedTargetStrikeRlDemo.metrics[0]?.phase).toBe("staging");
    expect(fixedTargetStrikeRlDemo.metrics.at(-1)?.doneReason).toBe("success");
  });
});

