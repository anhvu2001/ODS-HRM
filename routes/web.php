<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Requests\InputDetailController;
use App\Http\Controllers\Requests\RequestTemplateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Firebase\FirebaseController;
use App\Http\Controllers\Requests\UserRequestController;
use App\Models\UserRequests;
use App\Models\User;

use App\Mail\HelloWorldEmail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware(['auth'])->group(function () {
    // User Managerment
    Route::get('/', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

    Route::prefix('/users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('Users');
        Route::get('/detail/{id}', [UserController::class, 'view'])->name('Detail_users');
        Route::post('/update/{id}', [UserController::class, 'update'])->name('Update_users');
        Route::post('/delete', [UserController::class, 'delete'])->name('Delete_users');
        Route::post('/create', [UserController::class, 'create'])->name('Create_users');
    });
    // Request Templates
    Route::prefix('/request-templates')->group(function () {
        Route::get('/', [RequestTemplateController::class, 'index'])->name('Request_templates');
        Route::post('/create', [RequestTemplateController::class, 'create'])->name('Create_Request_template');
        Route::get('/{id}', [RequestTemplateController::class, 'edit'])->name('Detail_request_template');
        Route::put('/{id}', [RequestTemplateController::class, 'update'])->name('Update_request_template');
        Route::post('/{id}/update', [RequestTemplateController::class, 'updateField'])->name('Update_field_request_template');
        Route::post('/{id}', [RequestTemplateController::class, 'destroy'])->name('Delete_request_template');
        // Input detail routes

        Route::post('/{id}/input-details/create', [InputDetailController::class, 'create'])->name('Create_input_detail');
        Route::put('/{id}/input-details/{input_id}', [InputDetailController::class, 'update'])->name('Update_input_detail');
        Route::post('/{id}/input-details/{input_id}', [InputDetailController::class, 'delete'])->name('Delete_input_detail');
    });

    // User Request routes
    Route::prefix('/user_requests')->group(function () {
        Route::get('/', [UserRequestController::class, 'index'])->name('Request_list');
        Route::get('/detail/{id}', [UserRequestController::class, 'view'])->name('Request_Detail_Screen');
        Route::get('/edit/{id}', [UserRequestController::class, 'update_request_screen'])->name('Edit_Detail_Screen');
        Route::get('/create', [UserRequestController::class, 'add_new_request_screen'])->name('Create_User_Request_Screen');
        Route::post('/create-user-request', [UserRequestController::class, 'create'])->name('Create_User_Request');
        Route::post('/update-request-field', [UserRequestController::class, 'update_request_field'])->name('Update_Request_Field');
        Route::post('/update', [UserRequestController::class, 'update'])->name('Update_Request');

        Route::delete('/delete/{id}', [UserRequestController::class, 'delete'])->name('Delete_User_Request');
        // Route::get('', [UserRequestController::class, 'index'])->name('Requests_list');
    });
});

Route::get('/reset-password-danh', function () {
    // User::find(1)->update(['password' => Hash::make('Abc@123456')]);
    return response()->json(Hash::make('Abc@123456'));
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    //Firebase
    Route::post('/send-to-firebase/{id}', [FirebaseController::class, 'sendToFirebase'])->name('send-to-firebase');
    Route::get('/receive-to-firebase/{id}', [FirebaseController::class, 'index'])->name('receive-to-firebase');
    Route::post('/update-to-firebase/{id}', [FirebaseController::class, 'updateToFirebase'])->name('update-to-firebase');
    Route::post('/update-status-read/{id}', [FirebaseController::class, 'updateStatusRead'])->name('update-status-read');
});

require __DIR__ . '/auth.php';
