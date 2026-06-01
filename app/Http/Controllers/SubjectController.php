<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subjects = Subject::query();

        $subjects->when(
            request()->has('is_deleted'),
            fn($q) => $q->where('is_deleted', request()->boolean('is_deleted')),
        );

        return response()->json([
            'status' => 200,
            'data' => $subjects->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_deleted' => ['nullable', 'boolean'],
        ]);

        $subject = Subject::create(
            [
                'name' => $request->name,
                'description' => $request->description,
                'is_deleted' => $request->is_deleted
            ]
        );

        return response()->json([
            'status' => 200,
            'data' => $subject
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $subject = Subject::findOrFail($id);


        return response()->json([
            'status' => 200,
            'data' => $subject
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:20',
            'description' => 'nullable|string',
            'is_deleted'  => 'sometimes|boolean',
        ]);

        $subject->update($validatedData);

        return response()->json(['status' => 200, 'data' => $subject]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);

        $subject->delete();

        return response()->json(['status' => 200, 'message' => 'Subject deleted successfully']);
    }
}
