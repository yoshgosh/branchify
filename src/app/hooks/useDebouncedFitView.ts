// import { useEffect, useRef } from "react";
// import { useReactFlow } from "reactflow";

// function useDebouncedFunction(fn: () => void, delay: number) {
//     const timer = useRef<NodeJS.Timeout | null>(null);

//     return () => {
//         if (timer.current) clearTimeout(timer.current);
//         timer.current = setTimeout(() => {
//             fn();
//         }, delay);
//     };
// }

// export function useDebouncedFitView(dependencies: any[] = [], delay: number = 200, padding: number = 0.2) {
//     const { fitView } = useReactFlow();

//     const triggerFitView = useDebouncedFunction(() => {
//         fitView({ padding });
//     }, delay);

//     useEffect(() => {
//         triggerFitView();
//     }, dependencies);
// }