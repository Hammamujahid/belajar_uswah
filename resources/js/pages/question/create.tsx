import { api } from '@/lib/api';
import { usePage } from '@inertiajs/react';
import React, { useState } from 'react';

export default function CreateQuestion({ onSuccess }: { onSuccess?: () => void }) {
    const { id } = usePage<{ id: number }>().props;

    const [textQuestion, setTextQuestion] = useState('');
    const [imageQuestion, setImageQuestion] = useState<File | null>(null);

    const [answers, setAnswers] = useState([
        { text: '', image: null as File | null, isCorrect: false },
        { text: '', image: null as File | null, isCorrect: false },
        { text: '', image: null as File | null, isCorrect: false },
        { text: '', image: null as File | null, isCorrect: false },
    ]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAnswerChange = (index: number, field: string, value: any) => {
        const updated = [...answers];
        updated[index] = { ...updated[index], [field]: value };
        setAnswers(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('learning_material_id', id.toString())
            formData.append('question_text', textQuestion);
            if (imageQuestion) formData.append('question_image', imageQuestion);

            answers.forEach((ans, i) => {
                formData.append(`answers[${i}][text]`, ans.text);
                formData.append(`answers[${i}][is_correct]`, ans.isCorrect ? '1' : '0');

                // 🔥 image opsional
                if (ans.image) {
                    formData.append(`answers[${i}][image]`, ans.image);
                }
            });

            // contoh POST (sesuaikan endpoint kamu)
            await api.post('/question', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field?: string) =>
        `w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-border/60 bg-background ${
            field && errors[field] ? 'border-red-400' : 'border-border/30'
        }`;

    return (
        <form className="space-y-6 text-primary" onSubmit={handleSubmit}>
            {/* ================= SOAL ================= */}
            <div>
                <label className="mb-1 block text-sm font-medium">Teks Soal</label>
                <textarea
                    value={textQuestion}
                    onChange={(e) => setTextQuestion(e.target.value)}
                    placeholder="Teks Soal..."
                    rows={3}
                    className={`${inputClass('question_text')} resize-y`}
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Gambar Soal (Opsional)</label>
                <input type="file" accept="image/*" onChange={(e) => setImageQuestion(e.target.files?.[0] || null)} className={inputClass()} />
            </div>

            {/* ================= JAWABAN ================= */}
            <div className="space-y-4">
                <p className="text-sm font-semibold">Jawaban</p>

                {answers.map((ans, index) => (
                    <div key={index} className="space-y-3 rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">Jawaban {index + 1}</p>

                        {/* TEXT */}
                        <input
                            type="text"
                            value={ans.text}
                            onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                            placeholder="Teks Jawaban..."
                            className={inputClass()}
                        />

                        {/* IMAGE OPSIONAL */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAnswerChange(index, 'image', e.target.files?.[0] || null)}
                            className={inputClass()}
                        />

                        {/* PREVIEW IMAGE */}
                        {ans.image && <img src={URL.createObjectURL(ans.image)} alt="preview" className="h-24 w-24 rounded-md object-cover" />}

                        {/* CHECK BENAR */}
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={ans.isCorrect}
                                onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                            />
                            Jawaban Benar
                        </label>
                    </div>
                ))}
            </div>

            {/* SUBMIT */}
            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-600 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
                {loading ? 'Menyimpan...' : 'Simpan Soal'}
            </button>
        </form>
    );
}
