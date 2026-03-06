<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Citizen;
use App\Services\FonnteService;

class AuthController extends Controller
{
    protected FonnteService $fonnte;

    public function __construct(FonnteService $fonnte)
    {
        $this->fonnte = $fonnte;
    }

    private function notifyAdmin(string $message): void
    {
        $admin = User::whereHas('role', fn($q) => $q->where('name', 'Admin Desa'))
                     ->whereNotNull('phone')
                     ->first();

        if ($admin && $admin->phone) {
            $this->fonnte->send($admin->phone, $message);
        }
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'nik' => 'required|string|size:16|unique:citizens,nik',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Default role for new registration is 'Warga'
        $wargaRole = Role::where('name', 'Warga')->first();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $wargaRole ? $wargaRole->id : null,
            'active_status' => true,
        ]);
        
        // Auto-register to citizens table with default dummy data to satisfy constraints
        Citizen::create([
            'user_id' => $user->id,
            'nik' => $request->nik,
            'no_kk' => '-',
            'name' => $request->name,
            'birth_date' => '2000-01-01',
            'gender' => 'Laki-laki',
            'address' => '-',
            'religion' => '-',
            'education' => '-',
            'occupation' => '-',
            'marital_status' => '-',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User successfully registered',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('role')
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            // Notify admin only if the email belongs to a real account (wrong password scenario)
            $existingUser = User::where('email', $request->email)->first();
            if ($existingUser) {
                $this->notifyAdmin(
                    "⚠️ *Masalah Login Akun Warga*\n\n" .
                    "Ada percobaan login yang *gagal* (password salah) pada akun:\n" .
                    "👤 Nama : {$existingUser->name}\n" .
                    "📧 Email: {$existingUser->email}\n\n" .
                    "Jika warga tidak bisa masuk, Anda dapat mereset password akun tersebut melalui halaman Manajemen Pengguna di sistem administrasi desa."
                );
            }
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        if (!$user->active_status) {
            $this->notifyAdmin(
                "🚫 *Akun Warga Nonaktif Mencoba Login*\n\n" .
                "Ada percobaan login ke akun yang *dinonaktifkan*:\n" .
                "👤 Nama : {$user->name}\n" .
                "📧 Email: {$user->email}\n\n" .
                "Jika warga perlu mengakses sistem, Anda dapat mengaktifkan kembali akun tersebut melalui halaman Manajemen Pengguna di sistem administrasi desa."
            );
            return response()->json([
                'message' => 'Account is inactive'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('role')
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()->load('role'));
    }

    public function profile(Request $request)
    {
        $user = $request->user()->load('role');
        return response()->json(['message' => 'Success', 'data' => $user]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($request->only('name', 'phone'));

        return response()->json(['message' => 'Profil berhasil diperbarui', 'data' => $user->fresh()->load('role')]);
    }
}
