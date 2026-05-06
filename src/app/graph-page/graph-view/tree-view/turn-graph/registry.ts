import { TurnGraphComponent } from './type';
import TurnGraphOptimized from './optimized/TurnGraph';
import TurnGraphOptimizedV2 from './optimized-v2/TurnGraph';
import TurnGraphOptimizedV3 from './optimized-v3/TurnGraph';
import TurnGraphRT from './rt/TurnGraph';
import { LayoutMode } from '../models';

export const turnGraphRegistry: Record<LayoutMode, TurnGraphComponent> = {
    optimized: TurnGraphOptimized,
    'optimized-v2': TurnGraphOptimizedV2,
    'optimized-v3': TurnGraphOptimizedV3,
    rt: TurnGraphRT,
};
