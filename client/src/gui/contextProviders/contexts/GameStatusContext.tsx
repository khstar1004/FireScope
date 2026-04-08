import { createContext } from "react";

type GameStatusContextType = string;
type SetGameStatusContextType = (status: string) => void;

const GameStatusContext =
  createContext<GameStatusContextType>("시나리오 일시정지");
const SetGameStatusContext = createContext<SetGameStatusContextType>(
  (_status: string) => {}
);

export { GameStatusContext, SetGameStatusContext };
