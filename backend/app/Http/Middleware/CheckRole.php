<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user() || !in_array($request->user()->role?->name, $roles)) {
            \Illuminate\Support\Facades\Log::warning('CheckRole Failed: User ' . ($request->user() ? $request->user()->email : 'Guest') . ' with role ' . ($request->user() ? ($request->user()->role?->name ?? 'None') : 'None') . ' tried to access. Allowed roles: ' . implode(', ', $roles));
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        return $next($request);
    }
}
