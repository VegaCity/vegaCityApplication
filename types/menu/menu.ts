export type Menu = {
    id: string;
    title: string;
    link: string;
    icon?: string;
    children?: Menu[];
    ca?: 'sáng' | 'trưa' | 'tối';
};