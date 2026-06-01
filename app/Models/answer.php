<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class answer extends Model
{
    use HasFactory;

    protected  $fillable = [
        'question_id',
        'answer_text',
        'is_correct',
        'is_deleted',
        'media_path',
        'public_id',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
