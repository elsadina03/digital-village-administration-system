<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\CitizenController;
use App\Http\Controllers\API\LetterController;
use App\Http\Controllers\API\LetterTypeController;
use App\Http\Controllers\API\ComplaintController;
use App\Http\Controllers\API\ArchiveController;
use App\Http\Controllers\API\BudgetController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('letter-types', LetterTypeController::class)->only(['index']);

// Export endpoint dipindah ke publik (luar middleware) sementara untuk testing langsung dari browser
Route::get('citizens/export', [CitizenController::class, 'export']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Users (Only Admin)
    Route::middleware('role:Admin Desa')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Citizens (Admin & Kades can view stats/export, Admin can import and manage)
    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa')->group(function () {
        Route::get('citizens/stats', [CitizenController::class, 'stats']);
        Route::apiResource('citizens', CitizenController::class)->only(['index', 'show']);
    });
    
    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa')->group(function () {
        Route::post('citizens/import', [CitizenController::class, 'import']);
        Route::apiResource('citizens', CitizenController::class)->except(['index', 'show']);
    });

    // Letters & Complaints (Warga can index/store, Admin/Kades can manage)
    // The controller handles the separation of data (Warga sees own, Admin/Kades sees all)
    Route::apiResource('letters', LetterController::class)->only(['index', 'store', 'show']);
    Route::apiResource('complaints', ComplaintController::class)->only(['index', 'store', 'show']);

    // Admin Operations for Letters & Complaints (Update and Delete)
    // Kades can view (handled in show/index), Admin can process (update/delete)
    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa')->group(function () {
        Route::apiResource('letters', LetterController::class)->except(['index', 'store', 'show']);
        Route::apiResource('complaints', ComplaintController::class)->except(['index', 'store', 'show']);
    });
    
    // Archives (Warga and Admin)
    Route::apiResource('archives', ArchiveController::class)->only(['index', 'store', 'destroy']);
    
    // Keuangan Desa / Budgets (Admin, Kepdes, Bendahara)
    Route::get('budgets', [BudgetController::class, 'index']);
    Route::post('budgets', [BudgetController::class, 'store'])->middleware('role:Bendahara,Admin Desa,Kepala Desa');
});
