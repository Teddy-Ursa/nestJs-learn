export type Task = {
    id: number;
    title: string;
    completed: boolean;
};

export type CreateTaskBody = {
  title: string;
};
