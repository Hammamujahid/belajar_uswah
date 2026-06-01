import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { usePage } from '@inertiajs/react';
import React, { useState } from 'react';

type PageProps = {
    id: number;
};

export default function CreateQuestion({ onSuccess }: { onSuccess?: () => void }) {
    const { id } = usePage<PageProps>().props;
    const user = getUser();

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

        // ── Validasi frontend ──────────────────────────────────────
        const newErrors: Record<string, string> = {};

        if (!textQuestion.trim()) {
            newErrors['question_text'] = 'Teks soal wajib diisi.';
        }

        const correctCount = answers.filter((a) => a.isCorrect).length;
        if (correctCount !== 1) {
            newErrors['answers'] = 'Tepat 1 jawaban harus ditandai benar.';
        }

        answers.forEach((ans, i) => {
            if (!ans.text.trim()) {
                newErrors[`answers.${i}.text`] = `Jawaban ${i + 1} wajib diisi.`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        // ───────────────────────────────────────────────────────────

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('learning_material_id', id.toString());
            formData.append('question_text', textQuestion);
            formData.append('created_by', user?.name ?? ''); // ✅ dari getUser()

            if (imageQuestion) formData.append('question_image', imageQuestion);

            answers.forEach((ans, i) => {
                formData.append(`answers[${i}][text]`, ans.text);
                formData.append(`answers[${i}][is_correct]`, ans.isCorrect ? '1' : '0');
                if (ans.image) formData.append(`answers[${i}][image]`, ans.image);
            });

            await api.post('/api/question', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (onSuccess) onSuccess();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error?.status === 422) {
                const laravelErrors = error.data?.errors as Record<string, string[]>;
                const mapped: Record<string, string> = {};
                Object.entries(laravelErrors).forEach(([key, messages]) => {
                    mapped[key] = messages[0];
                });
                setErrors(mapped);
            } else {
                setErrors({ general: 'Terjadi kesalahan, coba lagi.' });
            }
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
            {errors.general && (
                <p className="rounded-md bg-red-50 p-2 text-sm text-red-500">{errors.general}</p>
            )}

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
                {errors['question_text'] && (
                    <p className="mt-1 text-xs text-red-500">{errors['question_text']}</p>
                )}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Gambar Soal (Opsional)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageQuestion(e.target.files?.[0] || null)}
                    className={inputClass()}
                />
            </div>

            {/* ================= JAWABAN ================= */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Jawaban</p>
                    {errors['answers'] && (
                        <p className="text-xs text-red-500">{errors['answers']}</p>
                    )}
                </div>

                {answers.map((ans, index) => (
                    <div key={index} className="space-y-3 rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">Jawaban {index + 1}</p>

                        <input
                            type="text"
                            value={ans.text}
                            onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                            placeholder="Teks Jawaban..."
                            className={inputClass(`answers.${index}.text`)}
                        />
                        {errors[`answers.${index}.text`] && (
                            <p className="text-xs text-red-500">{errors[`answers.${index}.text`]}</p>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAnswerChange(index, 'image', e.target.files?.[0] || null)}
                            className={inputClass()}
                        />

                        {ans.image && (
                            <img
                                src={URL.createObjectURL(ans.image)}
                                alt="preview"
                                className="h-24 w-24 rounded-md object-cover"
                            />
                        )}

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
