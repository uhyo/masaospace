import * as React from 'react';

export interface IPropPager {
    /**
     * Current page number.
     */
    current: number;
    /**
     * Minimum number.
     */
    min: number;
    /**
     * Maximum page number (if known).
     */
    max?: number;
    /**
     * Page number change event.
     */
    onChange(page: number): void;
}
/**
 * Pager.
 */
export default ({
    current,
    min,
    max,
    onChange,
}: IPropPager)=>{
    let prevButton;
    let nextButton;
    if (min < current) {
        // There is a previous page.
        const handleClick = ()=>{
            onChange(current-1);
        };
        prevButton =
            <button
                className="pager-button"
                onClick={handleClick}>
                {`\u27ea ${current-1}`}
            </button>;
    } else {
        prevButton =
            <button
                className="pager-button"
                disabled={true}>
                {`\u27ea`}
            </button>;
    }
    if (max == null || current < max) {
        // There may be a next page.
        const handleClick = ()=>{
            onChange(current+1);
        };
        nextButton =
            <button
                className="pager-button"
                onClick={handleClick}>
                {`${current+1} \u27eb`}
            </button>;
    } else {
        prevButton =
            <button
                className="pager-button"
                disabled={true}>
                {`\u27eb`}
            </button>;
    }
    return <div className="pager">
        {prevButton}
        <span className="pager-current">{current}</span>
        {nextButton}
    </div>;
};
