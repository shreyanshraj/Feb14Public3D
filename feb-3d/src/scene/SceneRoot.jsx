import { useStoryStore } from "../store/useStoryStore";
import Scene0 from "./scenes/Scene0_Loading";
import Scene1 from "./scenes/Scene1_Envelope";
import Scene2_YesNo from "./scenes/Scene2_YesNo";
import Scene3_Celebration from "./scenes/Scene3_Celebration";
import Scene4_Cards from "./scenes/Scene4_Cards";

import Scene5A_Dinner from "./scenes/Scene5A_Dinner";
import Scene5B_City from "./scenes/Scene5B_City";
import Scene5C_Phoenix from "./scenes/Scene5C_Phoenix";
import Scene5D_Secret from "./scenes/Scene5D_Secret";
import SceneFinal_Ask from "./scenes/SceneFinal_Ask";

export default function SceneRoot() {
  const scene = useStoryStore((s) => s.scene);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />

      {scene === "SCENE_0" && <Scene0 />}
      {scene === "SCENE_1" && <Scene1 />}
      {scene === "SCENE_2" && <Scene2_YesNo />}
      {scene === "SCENE_3" && <Scene3_Celebration />}
      {scene === "SCENE_4" && <Scene4_Cards />}

      {scene === "SCENE_5A" && <Scene5A_Dinner />}
      {scene === "SCENE_5B" && <Scene5C_Phoenix />}
      {scene === "SCENE_5C" && <Scene5B_City />}
      {scene === "SCENE_5D" && <Scene5D_Secret />}
      {scene === "SCENE_FINAL" && <SceneFinal_Ask />}
    </>
  );
}
