<?php

use App\Http\Controllers\AnswerController;
use Illuminate\Support\Facades\Route;

Route::post('/answer', [AnswerController::class, 'store']);
