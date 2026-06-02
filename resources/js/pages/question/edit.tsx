import { api } from '@/lib/api';
import { Question } from '@/types/interfaces';
import React, { useEffect, useState } from 'react';

export default function EditQuestion({ question, onSuccess }: { question: Question; onSuccess?: () => void }) {
    const [textQuestion, setTextQuestion] = useState(question.question_text);
    const [imageQuestion, setImageQuestion] = useState<File | null>(null);
    const [previewQuestion, setPreviewQuestion] = useState<string | null>(question.media_path);
    const [removeQuestionImage, setRemoveQuestionImage] = useState(false);
    const [removeAnswerImage, setRemoveAnswerImage] = useState<boolean[]>(question.answers?.map(() => false) ?? []);
    const [answers, setAnswers] = useState(
        question.answers?.map((ans) => ({
            id: ans.id,
            text: ans.answer_text,
            image: null as File | null,
            preview: ans.media_path,
            isCorrect: ans.is_correct,
        })) ?? [],
    );

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Sync ulang jika prop question berubah
    useEffect(() => {
        setTextQuestion(question.question_text);
        setPreviewQuestion(question.media_path);
        setImageQuestion(null);
        setRemoveQuestionImage(false); // ✅
        setRemoveAnswerImage(question.answers?.map(() => false) ?? []); // ✅
        setAnswers(
            question.answers?.map((ans) => ({
                id: ans.id,
                text: ans.answer_text,
                image: null,
                preview: ans.media_path,
                isCorrect: ans.is_correct,
            })) ?? [],
        );
        setErrors({});
    }, [question]);

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
            formData.append('_method', 'PATCH'); // Laravel method spoofing
            formData.append('question_text', textQuestion);
            if (imageQuestion) formData.append('question_image', imageQuestion);

            // Gambar soal
            formData.append('remove_question_image', removeQuestionImage ? '1' : '0');

            // Gambar jawaban
            answers.forEach((ans, i) => {
                formData.append(`answers[${i}][id]`, ans.id.toString());
                formData.append(`answers[${i}][text]`, ans.text);
                formData.append(`answers[${i}][is_correct]`, ans.isCorrect ? '1' : '0');
                formData.append(`answers[${i}][remove_image]`, removeAnswerImage[i] ? '1' : '0'); // ✅
                if (ans.image) formData.append(`answers[${i}][image]`, ans.image);
            });

            await api.post(`/api/question/${question.id}`, formData, {
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
            {errors.general && <p className="rounded-md bg-red-50 p-2 text-sm text-red-500">{errors.general}</p>}

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
                {errors['question_text'] && <p className="mt-1 text-xs text-red-500">{errors['question_text']}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Gambar Soal (Opsional)</label>

                {/* Preview + tombol hapus */}
                {previewQuestion && !removeQuestionImage && !imageQuestion && (
                    <div className="mb-2 flex items-start gap-2">
                        <img src={previewQuestion} alt="preview soal" className="h-24 w-auto rounded-md object-cover" />
                        <button
                            type="button"
                            onClick={() => setRemoveQuestionImage(true)}
                            className="flex items-center justify-center rounded-md bg-red-100 px-1 text-xs text-red-600 hover:bg-red-200"
                        >
                            x
                        </button>
                    </div>
                )}

                {/* Notif gambar akan dihapus */}
                {removeQuestionImage && (
                    <div className="mb-2 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                        <span>Gambar akan dihapus saat disimpan.</span>
                        <button type="button" onClick={() => setRemoveQuestionImage(false)} className="underline">
                            Batalkan
                        </button>
                    </div>
                )}

                {/* Preview gambar baru */}
                {imageQuestion && (
                    <img src={URL.createObjectURL(imageQuestion)} alt="preview soal baru" className="mb-2 h-24 w-auto rounded-md object-cover" />
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        setImageQuestion(e.target.files?.[0] || null);
                        setRemoveQuestionImage(false); // batalkan remove jika upload baru
                    }}
                    className={inputClass()}
                />
            </div>

            {/* ================= JAWABAN ================= */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Jawaban</p>
                    {errors['answers'] && <p className="text-xs text-red-500">{errors['answers']}</p>}
                </div>

                {answers.map((ans, index) => (
                    <div key={ans.id} className="space-y-3 rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">Jawaban {index + 1}</p>

                        <input
                            type="text"
                            value={ans.text}
                            onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                            placeholder="Teks Jawaban..."
                            className={inputClass(`answers.${index}.text`)}
                        />
                        {errors[`answers.${index}.text`] && <p className="text-xs text-red-500">{errors[`answers.${index}.text`]}</p>}

                        {/* Preview gambar lama + tombol hapus */}
                        {ans.preview && !removeAnswerImage[index] && !ans.image && (
                            <div className="flex items-start gap-2">
                                <img src={ans.preview} alt="preview jawaban" className="h-20 w-auto rounded-md object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = [...removeAnswerImage];
                                        updated[index] = true;
                                        setRemoveAnswerImage(updated);
                                    }}
                                    className="flex items-center justify-center rounded-md bg-red-100 px-1 text-xs text-red-600 hover:bg-red-200"
                                >
                                    x
                                </button>
                            </div>
                        )}

                        {/* Notif gambar akan dihapus */}
                        {removeAnswerImage[index] && (
                            <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                                <span>Gambar akan dihapus saat disimpan.</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = [...removeAnswerImage];
                                        updated[index] = false;
                                        setRemoveAnswerImage(updated);
                                    }}
                                    className="underline"
                                >
                                    Batalkan
                                </button>
                            </div>
                        )}

                        {/* Preview gambar baru */}
                        {ans.image && (
                            <img src={URL.createObjectURL(ans.image)} alt="preview jawaban baru" className="h-20 w-auto rounded-md object-cover" />
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                handleAnswerChange(index, 'image', e.target.files?.[0] || null);
                                // batalkan remove jika upload gambar baru
                                const updated = [...removeAnswerImage];
                                updated[index] = false;
                                setRemoveAnswerImage(updated);
                            }}
                            className={inputClass()}
                        />

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
                className="w-full rounded-lg bg-yellow-500 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </form>
    );
}
