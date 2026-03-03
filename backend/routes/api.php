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
use App\Http\Controllers\API\ProgramController;
use App\Http\Controllers\API\SocialAssistanceController;
use App\Http\Controllers\API\NewsController;
use App\Http\Controllers\API\GalleryController;

/*
 * ──────────────────────────────────────────────
 *  PUBLIC ROUTES (no auth required)
 * ──────────────────────────────────────────────
 */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('letter-types',  [LetterTypeController::class, 'index']);
Route::get('news',          [NewsController::class, 'index']);
Route::get('news/{news}',   [NewsController::class, 'show']);
Route::get('gallery',       [GalleryController::class, 'index']);
Route::get('citizens/export', [CitizenController::class, 'export']);

/* ── Stats publik (tanpa login) ───────────────── */
Route::get('public/stats', function () {
    return response()->json([
        'total_penduduk' => \App\Models\User::count(),
    ]);
});

/* ── Perangkat desa publik (untuk halaman Kontak) ─ */
Route::get('public/staff', function () {
    $staff = \App\Models\User::with('role')
        ->whereHas('role', fn($q) => $q->where('name', '!=', 'Warga'))
        ->orderBy('role_id')
        ->get()
        ->map(fn($u) => [
            'id'    => $u->id,
            'name'  => $u->name,
            'role'  => $u->role?->name,
            'phone' => $u->phone ?: null,
        ]);
    return response()->json(['data' => $staff]);
});

// Bantuan Sosial – publik view only
Route::get('social-assistances',              [SocialAssistanceController::class, 'index']);
Route::get('social-assistances/{socialAssistance}', [SocialAssistanceController::class, 'show']);
Route::get('assistance-recipients',           [SocialAssistanceController::class, 'recipients']);

/*
 * ──────────────────────────────────────────────
 *  AUTHENTICATED ROUTES
 * ──────────────────────────────────────────────
 */
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    /* ── User count (semua role yg login) ────────── */
    Route::get('users/count', [UserController::class, 'count']);

    /* ── Users list (semua staff, untuk dropdown PJ) */
    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa,Bendahara Desa')->group(function () {
        Route::get('users', [UserController::class, 'index']);
    });

    /* ── Users CRUD (Admin Desa only) ────────────── */
    Route::middleware('role:Admin Desa')->group(function () {
        Route::post('users',          [UserController::class, 'store']);
        Route::get('users/{user}',    [UserController::class, 'show']);
        Route::put('users/{user}',    [UserController::class, 'update']);
        Route::patch('users/{user}',  [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
    });

    /* ── Kependudukan (Admin, KepDes, Sekretaris) ── */
    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa')->group(function () {
        Route::get('citizens/stats',   [CitizenController::class, 'stats']);
        Route::post('citizens/import', [CitizenController::class, 'import']);
        Route::apiResource('citizens', CitizenController::class);
    });

    /* ── Surat: semua bisa baca/kirim ────────────── */
    Route::get('letters',                  [LetterController::class, 'index']);
    Route::post('letters',                 [LetterController::class, 'store']);

    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa')->group(function () {
        // generate-number MUST be before the {id} wildcard
        Route::get('letters/generate-number',  [LetterController::class, 'generateNumber']);
        Route::put('letters/{id}',             [LetterController::class, 'update']);
        Route::patch('letters/{id}',           [LetterController::class, 'update']);
        Route::delete('letters/{id}',          [LetterController::class, 'destroy']);
    });

    Route::get('letters/{id}',             [LetterController::class, 'show']);

    /* ── Pengaduan: semua bisa baca/kirim ─────────── */
    Route::get('complaints',       [ComplaintController::class, 'index']);
    Route::post('complaints',      [ComplaintController::class, 'store']);
    Route::get('complaints/{id}',  [ComplaintController::class, 'show']);

    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa')->group(function () {
        Route::put('complaints/{id}',    [ComplaintController::class, 'update']);
        Route::patch('complaints/{id}',  [ComplaintController::class, 'update']);
        Route::delete('complaints/{id}', [ComplaintController::class, 'destroy']);
    });

    /* ── Arsip ────────────────────────────────────── */
    Route::get('archives',         [ArchiveController::class, 'index']);
    Route::post('archives',        [ArchiveController::class, 'store']);
    Route::delete('archives/{id}', [ArchiveController::class, 'destroy']);

    /* ── Keuangan (Bendahara, Admin, KepDes) ──────── */
    Route::middleware('role:Bendahara,Admin Desa,Kepala Desa')->group(function () {
        Route::get('budgets',             [BudgetController::class, 'index']);
        Route::post('budgets',            [BudgetController::class, 'store']);
        Route::get('budgets/{budget}',    [BudgetController::class, 'show']);
        Route::put('budgets/{budget}',    [BudgetController::class, 'update']);
        Route::patch('budgets/{budget}',  [BudgetController::class, 'update']);
        Route::delete('budgets/{budget}', [BudgetController::class, 'destroy']);
    });

    /* ── Program & Kegiatan (Sekretaris, Admin, KepDes) */
    Route::middleware('role:Sekretaris Desa,Admin Desa,Kepala Desa')->group(function () {
        Route::get('programs',                                     [ProgramController::class, 'index']);
        Route::post('programs',                                    [ProgramController::class, 'store']);
        Route::get('programs/{program}',                           [ProgramController::class, 'show']);
        Route::put('programs/{program}',                           [ProgramController::class, 'update']);
        Route::patch('programs/{program}',                         [ProgramController::class, 'update']);
        Route::delete('programs/{program}',                        [ProgramController::class, 'destroy']);
        Route::get('programs/{program}/activities',                [ProgramController::class, 'activities']);
        Route::post('programs/{program}/activities',               [ProgramController::class, 'storeActivity']);
        Route::put('programs/{program}/activities/{activity}',     [ProgramController::class, 'updateActivity']);
        Route::patch('programs/{program}/activities/{activity}',   [ProgramController::class, 'updateActivity']);
        Route::delete('programs/{program}/activities/{activity}',  [ProgramController::class, 'destroyActivity']);
        Route::get('laporan-kegiatan',                             [ProgramController::class, 'laporanKegiatan']);
    });

    /* ── Bantuan Sosial - manage (Admin, KepDes) ──── */
    Route::middleware('role:Admin Desa,Kepala Desa')->group(function () {
        Route::post('social-assistances',                               [SocialAssistanceController::class, 'store']);
        Route::put('social-assistances/{socialAssistance}',             [SocialAssistanceController::class, 'update']);
        Route::patch('social-assistances/{socialAssistance}',           [SocialAssistanceController::class, 'update']);
        Route::delete('social-assistances/{socialAssistance}',          [SocialAssistanceController::class, 'destroy']);
        Route::post('social-assistances/{socialAssistance}/recipients', [SocialAssistanceController::class, 'addRecipient']);
        Route::put('assistance-recipients/{recipient}',                 [SocialAssistanceController::class, 'updateRecipient']);
        Route::delete('assistance-recipients/{recipient}',              [SocialAssistanceController::class, 'removeRecipient']);
    });

    /* ── Berita - manage (Admin, KepDes, Sekretaris) */
    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa')->group(function () {
        Route::post('news',          [NewsController::class, 'store']);
        Route::put('news/{news}',    [NewsController::class, 'update']);
        Route::patch('news/{news}',  [NewsController::class, 'update']);
        Route::delete('news/{news}', [NewsController::class, 'destroy']);
    });

    /* ── Galeri - manage (Admin, KepDes, Sekretaris) */
    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa')->group(function () {
        Route::post('gallery',            [GalleryController::class, 'store']);
        Route::delete('gallery/{gallery}',[GalleryController::class, 'destroy']);
    });

});


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('letter-types', LetterTypeController::class)->only(['index']);

// Export endpoint dipindah ke publik (luar middleware) sementara untuk testing langsung dari browser
Route::get('citizens/export', [CitizenController::class, 'export']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    /* -- User count (semua role yang login) */
    Route::get('users/count', [UserController::class, 'count']);

    // Users list (semua staff, untuk dropdown PJ)
    Route::middleware('role:Admin Desa,Kepala Desa,Sekretaris Desa,Bendahara Desa')->group(function () {
        Route::get('users', [UserController::class, 'index']);
    });

    // Users CRUD (Only Admin)
    Route::middleware('role:Admin Desa')->group(function () {
        Route::post('users',          [UserController::class, 'store']);
        Route::get('users/{user}',    [UserController::class, 'show']);
        Route::put('users/{user}',    [UserController::class, 'update']);
        Route::patch('users/{user}',  [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
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
