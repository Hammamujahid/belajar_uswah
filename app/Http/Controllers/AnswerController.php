<?php

namespace App\Http\Controllers;

use App\Models\answer;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class AnswerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
            'question_id' => 'required|exists:questions,id',
            'answer_text' => 'required|string|max:255',
            'media' => 'nullable|mimes:png,jpg,jpeg,svg,webp|max:2048'
        ]);

        $data = [
            'question_id' => $request->question_id,
            'answer_text' => $request->answer_text,
            'is_correct' => $request->is_correc,
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

        $answer = Answer::create($data);

        return response()->json([
            'data' => $answer->load('question'),
            'message' => 'Answer berhasil dikirim'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(answer $answer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(answer $answer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, answer $answer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(answer $answer)
    {
        //
    }
}
