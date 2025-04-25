import { getProgressColor } from "@/utils/taskProgressColor.js";

export default function TaskFlowProgress({ currentTaskFlow }) {
    const steps = JSON.parse(currentTaskFlow);
    // console.log(steps);
    return (
        <div className="w-1/5 h-fit pr-3">
            <div className="flex flex-col gap-3">
                <div className="font-bold text-lg w-full text-center">
                    Tiến trình
                </div>
                {steps && (
                    <div className="flex gap-4 flex-col">
                        {steps.map((step) => (
                            <div
                                id={step.step_id}
                                className={`${getProgressColor(
                                    step.status
                                )} flex items-center flex-shrink-0 gap-2`}
                            >
                                <svg
                                    className="flex-shrink-0"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0,0,256,256"
                                    width="24px"
                                    height="24px"
                                    fillRule="nonzero"
                                >
                                    <g
                                        // fill="#2dd86b"
                                        fillRule="nonzero"
                                        stroke="none"
                                        strokeWidth="1"
                                        strokeLinecap="butt"
                                        strokeLinejoin="miter"
                                        strokeMiterlimit="10"
                                        strokeDasharray=""
                                        strokeDashoffset="0"
                                    >
                                        <g transform="scale(8.53333,8.53333)">
                                            <path d="M15,3c-6.627,0 -12,5.373 -12,12c0,6.627 5.373,12 12,12c6.627,0 12,-5.373 12,-12c0,-2.17938 -0.59,-4.21686 -1.60547,-5.97852l-11.24805,11.24609c-0.187,0.187 -0.44103,0.29297 -0.70703,0.29297c-0.265,0 -0.52003,-0.10497 -0.70703,-0.29297l-4.45313,-4.45312c-0.391,-0.391 -0.391,-1.02306 0,-1.41406c0.391,-0.391 1.02306,-0.391 1.41406,0l3.74609,3.74609l10.80078,-10.80078c-2.201,-2.655 -5.52223,-4.3457 -9.24023,-4.3457zM24.24023,7.3457c0.43165,0.52058 0.81351,1.08435 1.1543,1.67383l2.3125,-2.3125c0.391,-0.392 0.391,-1.02306 0,-1.41406c-0.391,-0.391 -1.02306,-0.391 -1.41406,0z"></path>
                                        </g>
                                    </g>
                                </svg>
                                <div className="text-base flex-col">
                                    <div>{step.step_name}</div>
                                    <div className="text-gray-600 text-xs">
                                        {step?.next_assignee_name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
