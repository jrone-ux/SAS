import { Composition, Still } from "remotion";
import { Reel, REEL_SECONDS, Thumbnail } from "./Reel";
import { CAREERS_SECONDS, CareersReel, CareersThumbnail } from "./Careers";
import { BENEFITS_SECONDS, BenefitsReel, BenefitsThumbnail } from "./Benefits";
import { TRAINING_SECONDS, TrainingReel, TrainingThumbnail } from "./Training";
import { TRAINING2_SECONDS, TrainingReelV2, TrainingThumbnailV2 } from "./TrainingV2";
import { TRAINING3_SECONDS, TrainingReelV3 } from "./TrainingV3";
import { EMPOWER_SECONDS, EmpowermentLive } from "./Empowerment";
import { TESTIMONIAL_SECONDS, TestimonialReel } from "./Testimonial";
import { FILIPINO_SECONDS, FilipinoReel } from "./Filipino";
import { COVER_SECONDS, CoverTaskReel } from "./CoverTask";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AdminTasksReel"
        component={Reel}
        durationInFrames={REEL_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Still id="AdminTasksThumbnail" component={Thumbnail} width={1080} height={1920} />
      <Composition
        id="CareersReel"
        component={CareersReel}
        durationInFrames={CAREERS_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Still id="CareersThumbnail" component={CareersThumbnail} width={1080} height={1920} />
      <Composition
        id="BenefitsReel"
        component={BenefitsReel}
        durationInFrames={BENEFITS_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Still id="BenefitsThumbnail" component={BenefitsThumbnail} width={1080} height={1920} />
      <Composition
        id="TrainingReel"
        component={TrainingReel}
        durationInFrames={TRAINING_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Still id="TrainingThumbnail" component={TrainingThumbnail} width={1080} height={1920} />
      <Composition
        id="TrainingReelV2"
        component={TrainingReelV2}
        durationInFrames={TRAINING2_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Still id="TrainingThumbnailV2" component={TrainingThumbnailV2} width={1080} height={1920} />
      <Composition
        id="TrainingReelV3"
        component={TrainingReelV3}
        durationInFrames={TRAINING3_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="EmpowermentLive"
        component={EmpowermentLive}
        durationInFrames={EMPOWER_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="TestimonialReel"
        component={TestimonialReel}
        durationInFrames={TESTIMONIAL_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="FilipinoReel"
        component={FilipinoReel}
        durationInFrames={Math.round(FILIPINO_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="CoverTaskReel"
        component={CoverTaskReel}
        durationInFrames={Math.round(COVER_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
