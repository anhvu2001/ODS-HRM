<?php

use App\Http\Controllers\Comment\CommentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Requests\InputDetailController;
use App\Http\Controllers\Requests\RequestTemplateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\Firebase\FirebaseController;
use App\Http\Controllers\Firebase\NotificationCommentController;
use App\Http\Controllers\Projects\ProjectController;
use App\Http\Controllers\Projects\ProjectParticipantController;
use App\Http\Controllers\Requests\ApprovedRequestsController;
use App\Http\Controllers\Requests\ExcelController;
use App\Http\Controllers\Requests\SearchRequestController;
use App\Http\Controllers\Requests\UserRequestController;
use App\Http\Controllers\Requests\PdfUserRequestController;
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

Route::get('/export-requests', [ExcelController::class, 'index'])->name('Export-User-Requests');
Route::post('/export-requests', [ExcelController::class, 'filterData'])->name('Export-Data-UserRequest');
Route::post('/export-requests-excel', [ExcelController::class, 'exportUserRequests'])->name('Export-UserRequest-Excel');


Route::middleware(['auth'])->group(function () {
    // User Managerment
    Route::get('/', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
    // Export PDF request detail
    Route::get('/export-pdf/{id}', [PdfUserRequestController::class, 'index'])->name('Export-Pdf-UserRequest');
    // get all user
    Route::get('/get-all-users', [UserController::class, 'getAllUsers'])->name('Get_all_users');

    Route::prefix('/users')->middleware('check.role:99')->group(function () {
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
        // duplicate 14.01.2024
        Route::get("/duplicate/{id}", [UserRequestController::class, "duplicate"])->name("Duplicate_Request");
        Route::get('/create', [UserRequestController::class, 'add_new_request_screen'])->name('Create_User_Request_Screen');
        Route::post('/create-user-request', [UserRequestController::class, 'create'])->name('Create_User_Request');
        Route::post('/update-request-field', [UserRequestController::class, 'update_request_field'])->name('Update_Request_Field');
        Route::post('/update', [UserRequestController::class, 'update'])->name('Update_Request');
        Route::delete('/delete/{id}', [UserRequestController::class, 'delete'])->name('Delete_User_Request');
        // Route::get('', [UserRequestController::class, 'index'])->name('Requests_list');

    });
    // Project routes
    Route::prefix('/project')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('Project');
        Route::post('/create', [ProjectController::class, 'create'])->name('Create_Project');
        Route::get('/list-projects-by-user', [ProjectController::class, 'getProjectsByUser'])->name('List_Project_By_User');
        Route::get('/{projectId}/participants', [ProjectParticipantController::class, 'getParticipantsByProjectId'])->name('Get_ParticipantsByProjectId');;
        Route::get('/get-all-status', [ProjectController::class, 'getAllStatus'])->name('Get_All_Status');
        Route::put('/update/{projectId}', [ProjectController::class, 'update'])->name('Update_Project');
        Route::delete('/delete/{projectId}', [ProjectController::class, 'delete'])->name('Delete_Project');
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

    // comment
    Route::get('/get-all-comment/{id}', [CommentController::class, 'getCommentsByRequestId'])->name('Get-All-Comment');
    Route::post('/create-new-comment', [CommentController::class, 'storeComment'])->name('Create-New-Comment');
    Route::delete('/delete-comment/{id}', [CommentController::class, 'deleteComment'])->name('Delete-Comment');
    Route::post('/update-comment/{id}', [CommentController::class, 'update'])->name('Update-Comment');

    // notitfaction có người bình luận vào request
    Route::post('/create-notificaton-comment/{id}', [NotificationCommentController::class, 'sendCommentToFirebase'])->name('Create-Notificaton-Comment');
    Route::post('/update-notificaton-comment/{id}', [NotificationCommentController::class, 'updateStatusRead'])->name('Update-Notificaton-Comment');
    // search reuqest
    Route::get('/get-request-templates', [SearchRequestController::class, 'getRequestTemplates'])->name('Get-Request-Templates');
    Route::get('/list-approved-request', [ApprovedRequestsController::class, 'index'])->name('List-Approved-Request')->middleware('check.role:1,99');;
    // dvh 10/01/2025
    Route::middleware('check.role:99')->group(function () {
        // dvh 9/1/2025
        Route::prefix('/users')->group(function () {
            Route::post('/add-department/{id}', [UserController::class, 'addDepartment'])->name("Add_department_users");
            Route::post('/removeDepartment', [UserController::class, 'removeDepartment'])->name("Remove_department_users");
        });
        // department route
        Route::prefix('/departments')->group(function () {
            Route::get("/", [DepartmentController::class, 'index'])->name("Departments");
            Route::post('/create', [DepartmentController::class, 'create'])->name('Create_departments');
            Route::get('/detail/{id}', [DepartmentController::class, 'view'])->name('Detail_departments');
            Route::post('/update/{id}', [DepartmentController::class, 'update'])->name('Update_departments');
            Route::post('/delete', [DepartmentController::class, 'delete'])->name("Delete_departments");
        });
    });
});

require __DIR__ . '/auth.php';
