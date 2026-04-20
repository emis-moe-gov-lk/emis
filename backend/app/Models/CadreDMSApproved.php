<?php

namespace App\Models;

use App\Models\Workplaces;

use App\Models\SubjectList;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Models\MediumOfInstruction;
use App\Models\EmployerCadreSubject;
use Illuminate\Database\Eloquent\Model;
use App\Models\DivisionalEducationOffice;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CadreDMSApproved extends Model
{
    use HasFactory;

    protected $table = 'cadre_d_m_s_approveds';

    protected $primaryKey = 'id';

    protected $fillable = [
        'circular_id',
        'workplace_id',
        'subject_id',
        'medium_id',
        'approved_posts',
        'calculated_posts',
        'approval_type',
        'approved_date',
        'remarks',
        'is_verified',
        'verified_by',
        'verified_date',
        'is_confirmed',
        'confirmed_by',
        'confirmed_date',
        'active_status',
        'created_by',
        'updated_by',
    ];

    /* -----------------------------------------------------------------
     | Relationships
     |------------------------------------------------------------------
     */

    // Circular (cadre_circulars.circular_id)
    public function circular()
    {
        return $this->belongsTo(CadreCircular::class, 'circular_id', 'circular_id');
    }

    // Workplace (workplaces.workplace_id)
    public function workplace()
    {
        return $this->belongsTo(Workplace::class, 'workplace_id', 'workplace_id');
    }

    // Subject (subject_lists.subject_id)
    public function subject()
    {
        return $this->belongsTo(SubjectList::class, 'subject_id', 'subject_id');
    }

    // Medium (medium_of_instructions.medium_id)
    public function medium()
    {
        return $this->belongsTo(MediumOfInstruction::class, 'medium_id', 'medium_id');
    }

    /* -----------------------------------------------------------------
     | Audit & Workflow Users
     |------------------------------------------------------------------
     */

    public function creator()
    {
        return $this->belongsTo(People::class, 'created_by', 'people_id');
    }

    public function updater()
    {
        return $this->belongsTo(People::class, 'updated_by', 'people_id');
    }

    public function confirmer()
    {
        return $this->belongsTo(People::class, 'confirmed_by', 'people_id');
    }

    public function verifier()
    {
        return $this->belongsTo(People::class, 'verified_by', 'people_id');
    }

    /* -----------------------------------------------------------------
     | Summary
     |------------------------------------------------------------------
     */

    public static function approvedCadreSummary(string $circularId, string $workplaceId): Collection
    {
        $rows = self::with(['subject', 'medium'])
            ->where('circular_id', $circularId)
            ->where('workplace_id', $workplaceId)
            ->select('subject_id', 'medium_id')
            ->selectRaw('SUM(approved_posts) as total_approved_posts')
            ->groupBy('subject_id', 'medium_id')
            ->get(); // this is Eloquent\Collection of models

        // After groupBy + map, it becomes Support\Collection
        return $rows->groupBy('subject_id')->map(function (Collection $subjectRows) {
            $subject = $subjectRows->first()->subject;

            $mediumTotals = $subjectRows->mapWithKeys(function ($row) {
                return [
                    $row->medium_id => (int) $row->total_approved_posts,
                ];
            });

            $total = $subjectRows->sum('total_approved_posts');

            $is_verified = $subjectRows->first()->is_verified;
            $is_confirmed = $subjectRows->first()->is_confirmed;

            return [
                'subject'       => $subject,
                'medium_totals' => $mediumTotals,
                'total'         => $total,
                'is_verified'   => $is_verified,
                'is_confirmed'  => $is_confirmed,
            ];
        });
    }


    public static function institutionCadreVsEmployers(
        string $circularId,
        string $workplaceId,                 
        ?string $authorityId = null,  // optional filter
        ?string $institutionWorkplaceId = null, // optional filter
        ?string $deoWorkplaceId = null, // optional filter
        ?string $zeoWorkplaceId = null, // optional filter
        ?string $peoWorkplaceId = null // optional filter
    ): Collection {
        // 1) Find DEO office by workplace_id
        $office = Workplaces::where('workplace_id', $workplaceId)->first();
        $childWorkplaceId = $office->getAllChildWorkplaces();

        if (! $childWorkplaceId) {
            abort(404, 'Divisional Education Office not found');
        }

        // 2) Get all child institution workplace IDs under this DEO, with optional filters
        $institutionsQuery = Institution::whereIn('workplace_id', $childWorkplaceId);

        if (! is_null($authorityId)) {
            $institutionsQuery->where('authority_id', $authorityId);
        }

        if (! is_null($institutionWorkplaceId)) {
            // If you want an exact match to a single institution workplace_id
            $institutionsQuery->where('workplace_id', $institutionWorkplaceId);

            // If instead you intend to pass an array of workplace_ids:
            // $institutionsQuery->whereIn('workplace_id', (array) $institutionWorkplaceId);
        }

        if (! is_null($deoWorkplaceId)) {
            $institutionsQuery->where('deo_wp_id', $deoWorkplaceId);
        }

        if (! is_null($zeoWorkplaceId)) {
            $institutionsQuery->where('zeo_wp_id', $zeoWorkplaceId);
        }

        if (! is_null($peoWorkplaceId)) {
            $institutionsQuery->whereHas('zonalEducationOffice', function ($q) use ($peoWorkplaceId) {
                $q->where('peo_wp_id', $peoWorkplaceId);
            });
        }
        
        $institutionIds = $institutionsQuery
            ->pluck('workplace_id')
            ->toArray();

        if (empty($institutionIds)) {
            // No institutions found under this DEO (with given filters) → nothing to compare
            return collect();
        }

        // 3) Approved posts from DMS for all institutions under this DEO (with filters)
        $approvedRows = self::query()
            ->where('circular_id', $circularId)
            ->whereIn('workplace_id', $institutionIds)
            ->select('subject_id', 'medium_id')
            ->selectRaw('SUM(approved_posts) as approved_posts')
            ->groupBy('subject_id', 'medium_id')
            ->get();

        $approvedMap = [];
        foreach ($approvedRows as $row) {
            $key = $row->subject_id . '|' . $row->medium_id;
            $approvedMap[$key] = $row;
        }

        // 4) Filled posts from employers currently in these institutions
        $filledRows = EmployerCadreSubject::query()
            ->join(
                'employer_current_appointments as eca',
                'eca.employee_id',
                '=',
                'employer_cadre_subjects.employee_id'
            )
            ->whereIn('eca.workplace_id', $institutionIds)
            ->whereNotNull('employer_cadre_subjects.main_subject')
            ->whereNotNull('employer_cadre_subjects.appointment_medium')
            // Optional: filter to active appointments if such a column exists
            // ->where('eca.active_status', 1)
            ->select(
                'employer_cadre_subjects.main_subject as subject_id',
                'employer_cadre_subjects.appointment_medium as medium_id',
                DB::raw('COUNT(*) as filled_posts')
            )
            ->groupBy('employer_cadre_subjects.main_subject', 'employer_cadre_subjects.appointment_medium')
            ->get();

        $filledMap = [];
        foreach ($filledRows as $row) {
            $key = $row->subject_id . '|' . $row->medium_id;
            $filledMap[$key] = $row;
        }

        // 5) Collect all subject+medium combinations that appear in approved or filled
        $allKeys = collect(
            array_unique(
                array_merge(array_keys($approvedMap), array_keys($filledMap))
            )
        );

        if ($allKeys->isEmpty()) {
            return collect();
        }

        // 6) Preload subjects and mediums to avoid N+1 queries
        [$subjectIds, $mediumIds] = $allKeys->reduce(function ($carry, $key) {
            [$subjectId, $mediumId] = explode('|', $key);
            $carry[0][] = $subjectId;
            $carry[1][] = $mediumId;
            return $carry;
        }, [[], []]);

        $subjectIds = array_unique($subjectIds);
        $mediumIds  = array_unique($mediumIds);

        $subjectCache = SubjectList::whereIn('subject_id', $subjectIds)
            ->get()
            ->keyBy('subject_id');

        $mediumCache = MediumOfInstruction::whereIn('medium_id', $mediumIds)
            ->get()
            ->keyBy('medium_id');

        // 7) Build final collection
        $rows = $allKeys->map(function (string $key) use ($approvedMap, $filledMap, $subjectCache, $mediumCache) {

            [$subjectId, $mediumId] = explode('|', $key);

            // Approved posts
            $approved = isset($approvedMap[$key])
                ? (int) $approvedMap[$key]->approved_posts
                : 0;

            // Filled posts
            $filled = isset($filledMap[$key])
                ? (int) $filledMap[$key]->filled_posts
                : 0;

            // Difference and status (Filled - Approved)
            $diff = $filled - $approved;

            if ($diff === 0) {
                $status = 'Balanced';
            } elseif ($diff > 0) {
                $status = 'Excess';
            } else {
                $status = 'Deficit';
            }

            // Subject name and type
            $subject = $subjectCache->get($subjectId);
            $subjectName      = $subject?->name_en ?? $subject?->name_si ?? $subject?->name_ta ?? $subjectId;
            $subjectType      = $subject?->type ?? null;
            $subjectTypeName  = $subject?->type_name ?? 'Unknown';

            // Medium name
            $medium = $mediumCache->get($mediumId);
            $mediumName = $medium?->name ?? $mediumId;

            return [
                'subject_id'        => $subjectId,
                'subject_name'      => $subjectName,
                'subject_type'      => $subjectType,
                'subject_type_name' => $subjectTypeName,
                'medium_id'         => $mediumId,
                'medium_name'       => $mediumName,
                'approved_posts'    => $approved,
                'filled_posts'      => $filled,
                'diff'              => $diff,
                'status'            => $status,
            ];
        });

        return $rows->sortBy('subject_id')->values();
    }



    public static function institutionCadreVsEmployersWithList(string $circularId, string $workplaceId): Collection
    {
        // 1) Approved posts (from DMS approved cadre)
        $approvedRows = self::with(['subject', 'medium'])
            ->where('circular_id', $circularId)
            ->where('workplace_id', $workplaceId)
            ->select('subject_id', 'medium_id')
            ->selectRaw('SUM(approved_posts) as approved_posts')
            ->groupBy('subject_id', 'medium_id')
            ->get();

        $approvedMap = [];
        foreach ($approvedRows as $row) {
            $key = $row->subject_id . '|' . $row->medium_id;
            $approvedMap[$key] = $row;
        }

        // 2) All Employers in this workplace with main_subject + appointment_medium
        //    Join EmployerCurrentAppointment to get appoint_date for ordering.
        $teachers = EmployerCadreSubject::query()
            ->with([
                'employee',              // People (for name)
                'currentAppointment',    // EmployerCurrentAppointment (for service_years, appoint_date)
                'mainSubject',           // SubjectList
                'medium',                // MediumOfInstruction (appointment_medium)
            ])
            ->join('employer_current_appointments as eca', 'eca.appointment_id', '=', 'employer_cadre_subjects.appointment_id')
            ->where('eca.workplace_id', $workplaceId)
            ->whereNotNull('employer_cadre_subjects.main_subject')
            ->whereNotNull('employer_cadre_subjects.appointment_medium')
            ->select('employer_cadre_subjects.*', 'eca.appoint_date')
            // Order by subject, medium, then by appoint_date ascending
            // (oldest appointment = longest service in current school)
            ->orderBy('employer_cadre_subjects.main_subject')
            ->orderBy('employer_cadre_subjects.appointment_medium')
            ->orderBy('eca.appoint_date', 'asc')
            ->get();

        // Group Employers by subject+medium
        $teachersByKey = $teachers->groupBy(function (EmployerCadreSubject $t) {
            return $t->main_subject . '|' . $t->appointment_medium;
        });

        // 3) Collect all subject+medium keys (union of approved + Employers)
        $allKeys = collect(
            array_unique(
                array_merge(
                    array_keys($approvedMap),
                    $teachersByKey->keys()->toArray()
                )
            )
        );

        // Small caches to avoid repeated DB queries
        $subjectCache = [];
        $mediumCache  = [];

        return $allKeys
            ->map(function (string $key) use ($approvedMap, $teachersByKey, &$subjectCache, &$mediumCache) {
                [$subjectId, $mediumId] = explode('|', $key);

                // Approved posts
                $approved = isset($approvedMap[$key])
                    ? (int) $approvedMap[$key]->approved_posts
                    : 0;

                // Employers collection (may be empty)
                /** @var \Illuminate\Support\Collection $teacherList */
                $teacherList = $teachersByKey->get($key, collect());

                // Filled posts = number of Employers
                $filled = $teacherList->count();

                // Difference and status
                $diff = $filled - $approved;
                if ($diff === 0) {
                    $status = 'Balanced';
                } elseif ($diff > 0) {
                    $status = 'Excess';
                } else {
                    $status = 'Deficit';
                }

                // Subject name + type
                if (!isset($subjectCache[$subjectId])) {
                    $subjectCache[$subjectId] = SubjectList::where('subject_id', $subjectId)->first();
                }
                $subject = $subjectCache[$subjectId];
                $subjectName = $subject?->name_en
                    ?? $subject?->name_si
                    ?? $subject?->name_ta
                    ?? $subjectId;
                $subjectType      = $subject?->type ?? null;
                $subjectTypeName  = $subject?->type_name ?? 'Unknown';

                // Medium name
                if (!isset($mediumCache[$mediumId])) {
                    $mediumCache[$mediumId] = MediumOfInstruction::where('medium_id', $mediumId)->first();
                }
                $medium = $mediumCache[$mediumId];
                $mediumName = $medium?->name ?? (string) $mediumId;

                return [
                    'subject_id'         => $subjectId,
                    'subject_name'       => $subjectName,
                    'subject_type'       => $subjectType,
                    'subject_type_name'  => $subjectTypeName,
                    'medium_id'          => $mediumId,
                    'medium_name'        => $mediumName,
                    'approved_posts'     => $approved,
                    'filled_posts'       => $filled,
                    'diff'               => $diff,
                    'status'             => $status,
                    'teachers'           => $teacherList, // already ordered by appoint_date
                ];
            })
            ->sortBy('subject_id')
            ->values();
    }
}

