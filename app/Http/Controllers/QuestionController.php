<?php

namespace App\Http\Controllers;

use App\Models\question;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Models\Answer;
use Illuminate\Support\Str;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $questions = Question::with('answers');

        $questions->when(
            $request->has('is_deleted'),
            fn($q) => $q->where('is_deleted', $request->boolean('is_deleted')),
        );

        $questions->when(
            $request->has('learning_material_id'),
            fn($q) => $q->where('learning_material_id', $request->learning_material_id)
        );

        return response()->json([
            'status' => 200,
            'data' => $questions->get()
        ]);
    }

    public function latest()
    {
        $newQuestions = question::where('is_deleted', false)
            ->where('created_at', '>=', now()->subWeek())
            ->count();
        return response()->json(['status' => 200, 'data' => $newQuestions]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'learning_material_id'   => 'required|exists:learning_materials,id',
            'question_text'          => 'required|string|max:1000',
            'created_by'             => 'required|string|max:255',
            'question_image'         => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',

            'answers'                => 'required|array|size:4',
            'answers.*.text'         => 'required|string|max:255',
            'answers.*.is_correct'   => 'required|in:0,1',
            'answers.*.image'        => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        // Validasi tepat 1 jawaban benar
        $correctCount = collect($request->input('answers'))
            ->where('is_correct', '1')
            ->count();

        if ($correctCount !== 1) {
            return response()->json([
                'message' => 'Tepat 1 jawaban harus ditandai benar.'
            ], 422);
        }

        // ── 1. Upload gambar soal (opsional) ────────────────────────────
        $questionData = [
            'learning_material_id' => $request->learning_material_id,
            'question_text'        => $request->question_text,
            'created_by'           => $request->created_by,
            'is_deleted'           => false,
        ];

        if ($request->hasFile('question_image')) {
            $upload = Cloudinary::uploadApi()->upload(
                $request->file('question_image')->getRealPath(),
                [
                    'folder'    => 'e-learning/questions',
                    'public_id' => 'question-' . time(),
                ]
            );
            $questionData['media_path'] = $upload['secure_url'];
            $questionData['public_id']  = $upload['public_id'];
        }

        // ── 2. Simpan soal ──────────────────────────────────────────────
        $question = Question::create($questionData);

        // ── 3. Loop jawaban, upload gambar jika ada ─────────────────────
        $answersData = [];

        foreach ($request->input('answers') as $index => $answerInput) {
            $row = [
                'question_id' => $question->id,
                'answer_text' => $answerInput['text'],
                'is_correct'  => $answerInput['is_correct'] === '1',
                'is_deleted'  => false,
                'created_at'  => now(),
                'updated_at'  => now(),
            ];

            if ($request->hasFile("answers.{$index}.image")) {
                $upload = Cloudinary::uploadApi()->upload(
                    $request->file("answers.{$index}.image")->getRealPath(),
                    [
                        'folder'    => 'e-learning/answers',
                        'public_id' => "answer-{$index}-" . time(),
                    ]
                );
                $row['media_path'] = $upload['secure_url'];
                $row['public_id']  = $upload['public_id'];
            }

            $answersData[] = $row;
        }

        // ── 4. Insert 4 jawaban sekaligus (1 query) ─────────────────────
        Answer::insert($answersData);

        return response()->json([
            'message' => 'Soal dan jawaban berhasil disimpan',
            'data'    => $question->load('answers'),
        ], 201);
    }
    /**
     * Display the specified resource.
     */
    public function show(question $question)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(question $question)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, question $question)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(question $question)
    {
        //
    }
}
