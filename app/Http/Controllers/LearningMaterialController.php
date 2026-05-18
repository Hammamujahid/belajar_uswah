<?php

namespace App\Http\Controllers;

use App\Models\LearningMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Str;

class LearningMaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $materials = LearningMaterial::query();

        $materials->when(
            $request->has('is_deleted'),
            fn($q) => $q->where('is_deleted', $request->boolean('is_deleted')),
        );

        $materials->when(
            $request->boolean('subject'),
            fn($q) => $q->with('subject')
        );

        return response()->json([
            'status' => 200,
            'data' => $materials->get()
        ]);
    }

    public function latest()
    {
        $newMaterials = LearningMaterial::where('is_deleted', false)
            ->where('created_at', '>=', now()->subWeek())
            ->count();
        return response()->json(['status' => 200, 'data' => $newMaterials]);
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
            'subject_id'  => 'required|exists:subjects,id',
            'name'        => 'required|string|max:50',
            'description' => 'nullable|string|max:255',
            'file'        => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx|max:20480',
        ]);

        $data = [
            'subject_id'  => $request->subject_id,
            'name'        => $request->name,
            'description' => $request->description,
            'created_by'  => $request->user()->name ?? 'system',
            'is_deleted'  => false,
        ];

        if ($request->hasFile('file')) {
            try {
                $originalName = pathinfo(
                    $request->file('file')->getClientOriginalName(),
                    PATHINFO_FILENAME
                );
                $uploadedFile = Cloudinary::uploadApi()->upload(
                    $request->file('file')->getRealPath(),
                    [
                        'folder' => 'e-learning',
                        'resource_type' => 'raw',
                        'public_id'     => Str::slug($originalName) . '-' . time(),
                        'filename_override' => $request->file('file')->getClientOriginalName(),
                        'use_filename' => true,
                    ]
                );
                $data['file_path'] = $uploadedFile['secure_url'];
                $data['public_id'] = $uploadedFile['public_id'];
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Gagal upload file: ' . $e->getMessage()
                ], 500);
            }
        }

        $learningMaterial = LearningMaterial::create($data);

        return response()->json([
            'data' => $learningMaterial->load('subject'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $query = LearningMaterial::query();


        $query->when(
            $request->boolean('subject'),
            fn($q) => $q->with('subject')
        );

        $material = $query->findOrFail($id);


        return response()->json([
            'status' => 200,
            'data' => $material
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LearningMaterial $learningMaterial)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $learningMaterial = LearningMaterial::findOrFail($id);

        $request->validate([
            'subject_id'  => 'sometimes|exists:subjects,id',
            'name'        => 'sometimes|string|max:50',
            'created_by'  => 'sometimes|string|max:50',
            'description' => 'nullable|string|max:255',
            'file'        => 'sometimes|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx|max:20480',
            'remove_file' => 'sometimes|boolean',
            'is_deleted'  => 'sometimes|boolean',
        ]);

        $data = $request->only(['subject_id', 'name', 'created_by', 'description', 'is_deleted']);

        if ($request->boolean('remove_file') && $learningMaterial->file_path) {
            Cloudinary::uploadApi()->destroy($learningMaterial->public_id, [
                'resource_type' => 'raw',
            ]);
            $data = array_merge($data, [
                'file_path' => null,
                'public_id' => null,
            ]);
        }

        if ($request->hasFile('file')) {
            if ($learningMaterial->file_path) {
                Cloudinary::uploadApi()->destroy($learningMaterial->public_id, [
                    'resource_type' => 'raw',
                ]);
            }
            try {
                $originalName = pathinfo(
                    $request->file('file')->getClientOriginalName(),
                    PATHINFO_FILENAME
                );
                $uploadedFile = Cloudinary::uploadApi()->upload(
                    $request->file('file')->getRealPath(),
                    [
                        'folder' => 'e-learning',
                        'resource_type' => 'raw',
                        'public_id'     => Str::slug($originalName) . '-' . time(),
                        'filename_override' => $request->file('file')->getClientOriginalName(),
                        'use_filename' => true,
                    ]
                );
                $data['file_path'] = $uploadedFile['secure_url'];
                $data['public_id'] = $uploadedFile['public_id'];
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Gagal upload file: ' . $e->getMessage()
                ], 500);
            }
        }

        $learningMaterial->update($data);

        return response()->json([
            'data' => $learningMaterial->load('subject'),
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $learningMaterial = LearningMaterial::findOrFail($id);

        $learningMaterial->delete();

        return response()->json(['status' => 200, 'message' => 'Material deleted successfully']);
    }
}
