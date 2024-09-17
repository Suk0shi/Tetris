import { Block, SHAPES } from "../types";

interface Props {
    holdingBlock: Block | null;
}

function HoldingBlock({ holdingBlock }: Props) {
    return (
        <div className="holding"> 
            {holdingBlock === null ? null : SHAPES[holdingBlock].shape.filter((row) => row.some((cell) => cell)).map((row, rowIndex) => {
                return (
                    <div key={rowIndex} className="row">
                        {row.map((isSet, cellIndex) => {
                            const cellClass = isSet ? holdingBlock : 'hidden';
                            const key = `${rowIndex}-${cellIndex}`;
                            return (
                                <div key={key} className={`cell ${cellClass}`}></div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    );
}

export default HoldingBlock;