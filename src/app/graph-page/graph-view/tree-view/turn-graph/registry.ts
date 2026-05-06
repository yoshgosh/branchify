import { TurnGraphComponent } from './type';
import TurnGraphOptimizedV2 from './optimized-v2/TurnGraph';
import TurnGraphRT from './rt/TurnGraph';
import { LayoutMode } from '../models';

export const turnGraphRegistry: Record<LayoutMode, TurnGraphComponent> = {
    'optimized-v2': TurnGraphOptimizedV2,
    rt: TurnGraphRT,
};
