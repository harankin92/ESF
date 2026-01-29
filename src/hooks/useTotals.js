import { useMemo } from 'react';

export const calculateTotals = (sections, manualRoles, qaPercent, pmPercent, qaRate, pmRate, discount = 0) => {
    let devOpt = 0;
    let devPess = 0;
    let devCostOpt = 0;
    let devCostPess = 0;

    // Per-task QA/PM accumulation
    let qaOpt = 0;
    let qaPess = 0;
    let pmOpt = 0;
    let pmPess = 0;

    const roleStats = manualRoles.reduce((acc, r) => {
        acc[r.id] = { min: 0, max: 0, costOpt: 0, costPess: 0 };
        return acc;
    }, {});

    sections.forEach(sec => {
        sec.tasks.forEach(task => {
            // Calculate task dev hours
            let taskDevMin = 0;
            let taskDevMax = 0;

            manualRoles.forEach(role => {
                const est = task.estimates[role.id] || { min: 0, max: 0 };
                roleStats[role.id].min += est.min;
                roleStats[role.id].max += est.max;
                roleStats[role.id].costOpt += est.min * role.rate;
                roleStats[role.id].costPess += est.max * role.rate;

                devOpt += est.min;
                devPess += est.max;
                devCostOpt += est.min * role.rate;
                devCostPess += est.max * role.rate;

                taskDevMin += est.min;
                taskDevMax += est.max;
            });

            // QA per task (if enabled)
            const includeQA = task.includeQA !== false;
            if (includeQA) {
                qaOpt += Math.round(taskDevMin * (qaPercent / 100));
                qaPess += Math.round(taskDevMax * (qaPercent / 100));
            }

            // PM per task (if enabled)
            const includePM = task.includePM !== false;
            if (includePM) {
                const taskQAMin = includeQA ? Math.round(taskDevMin * (qaPercent / 100)) : 0;
                const taskQAMax = includeQA ? Math.round(taskDevMax * (qaPercent / 100)) : 0;
                pmOpt += Math.round((taskDevMin + taskQAMin) * (pmPercent / 100));
                pmPess += Math.round((taskDevMax + taskQAMax) * (pmPercent / 100));
            }
        });
    });

    const qaCostOpt = qaOpt * qaRate;
    const qaCostPess = qaPess * qaRate;
    const pmCostOpt = pmOpt * pmRate;
    const pmCostPess = pmPess * pmRate;

    const totalOptHours = devOpt + qaOpt + pmOpt;
    const totalPessHours = devPess + qaPess + pmPess;
    const totalCostOpt = devCostOpt + qaCostOpt + pmCostOpt;
    const totalCostPess = devCostPess + qaCostPess + pmCostPess;

    // Timeline (weeks) based on most loaded specialist
    const maxWeeks = Math.max(...manualRoles.map(r => {
        const hours = roleStats[r.id].max;
        return r.hoursPerDay > 0 ? hours / (r.hoursPerDay * 5) : 0;
    }), 0);

    // Discount Calculation
    // const discount is passed as argument now
    const avgCost = (totalCostOpt + totalCostPess) / 2;
    const discountedCost = discount > 0 ? avgCost * (1 - discount / 100) : 0;

    return {
        devOpt, devPess, devCostOpt, devCostPess,
        qaOpt, qaPess, qaCostOpt, qaCostPess,
        pmOpt, pmPess, pmCostOpt, pmCostPess,
        totalOptHours, totalPessHours, totalCostOpt, totalCostPess,
        maxWeeks, roleStats,
        discountedCost
    };
};

export const useTotals = (sections, manualRoles, qaPercent, pmPercent, qaRate, pmRate, discount = 0) => {
    return useMemo(() => {
        return calculateTotals(sections, manualRoles, qaPercent, pmPercent, qaRate, pmRate, discount);
    }, [sections, manualRoles, qaPercent, pmPercent, qaRate, pmRate, discount]);
};
