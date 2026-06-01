export interface Subject {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface LearningMaterial {
    id: number;
    subject_id: number;
    subject?: {
        id: number;
        name: string;
    };
    name: string;
    created_by: string;
    description: string;
    file_path: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface Question {
    id: number;
    learning_material_id: number;
    learning_material?: {
        id: number;
        name: string;
    };
    answers?: Answer[];
    media_path: string;
    question_text: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface Answer {
    id: number;
    question_id: number;
    answer_text: string;
    is_correct: boolean;
    media_path: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface Activity{
    id: number;
    model_id: number;
    type: string;
    description: string;
    action: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface Profile {
    id: number;
    user?:{
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
        updated_at: string;
    }
    city_id: number;
    city?: City | null;
    fullname: string;
    birth_date: string;
    phone_number: string;
    gender: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface City {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}
