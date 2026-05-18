<?php

namespace App\Http\Controllers;

use App\Models\question;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Str;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $questions = Question::query();

        $questions->when(
            $request->has('is_deleted'),
            fn($q) => $q->where('is_deleted', $request->boolean('is_deleted')),
        );

        $questions->when(
            $request->has('learning_material_id'),
            fn($q) => $q->where('learning_materia_id', $request->learning_material_id)
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
            'learning_material_id' => 'required|exists:learning_materials,id',
            'media' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'question_text' => 'required|string|max:1000',
            'created_by' => 'required|string|max:255'
        ]);

        $data = [
            'learning_material_id' => $request->learning_material_id,
            'question_text' => $request->question_text,
            'created_by' => $request->created_by,
            'is_deleted' => false
        ];

        if ($request->hasFile('media')) {
            try {
                $uploadImage = Cloudinary::uploadApi()->upload(
                    $request->image('media')->getRealPath(),
                    [
                        'folder' => 'e-learning',
                        'resource_type' => 'auto',
                        'public_id' => $request->learning_material_id . '-soal' . time()
                    ]
                );
                $data['media_path'] = $uploadImage['secure_url'];
                $data['public_id'] = $uploadImage['public_id'];
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Gagal upload image: ' . $e->getMessage()
                ], 500);
            }
        }

        $question = Question::create($data);

        return response()->json([
            'data' => $question->load('learning_material'),
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
