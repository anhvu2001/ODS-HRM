export const remainingDay = (due_date) => {
    const curDay = new Date();
    const dueDay = new Date(due_date);

    const difference = dueDay - curDay;
    const remaining = Math.ceil(difference / (1000 * 60 * 60 * 24));

    return remaining > 0 ? remaining : 0;
};
