import { TurnGraphComponent } from './type';
import TurnGraphOptimized from './optimized/TurnGraph';
import TurnGraphRT from './rt/TurnGraph';
import { LayoutMode } from '../models';

export const turnGraphRegistry: Record<LayoutMode, TurnGraphComponent> = {
    optimized: TurnGraphOptimized,
    rt: TurnGraphRT,
};
