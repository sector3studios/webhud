export enum ESession {
	Unavailable = -1,
	Practice = 0,
	Qualify = 1,
	Race = 2,
	Warmup = 3
}

export enum ESessionPhase {
	Unavailable = -1,

	/** Currently in garage */
	Garage = 1,

	/** Gridwalk or track walkthrough */
	Gridwalk = 2,

	/** Formation lap, rolling start etc. */
	Formation = 3,

	/** Countdown to race is ongoing */
	Countdown = 4,

	/** Race is ongoing */
	Green = 5,

	/** End of session */
	Checkered = 6
}

export enum EControl {
	Unavailable = -1,

	/** Controlled by the actual player */
	Player = 0,

	/** Controlled by AI */
	AI = 1,

	/** Controlled by a network entity of some sort */
	Remote = 2,

	/** Controlled by a replay or ghost */
	Replay = 3
}

export enum EPitWindow {
	Unavailable = -1,

	/** Pit stops are not enabled for this session */
	Disabled = 0,

	/** Pit stops are enabled, but you're not allowed to perform one right now */
	Closed = 1,

	/** Allowed to perform a pit stop now */
	Open = 2,

	/** Currently performing the pit stop changes (changing driver, etc.) */
	Stopped = 3,

	/** After the current mandatory pitstop have been completed */
	Completed = 4
}

export enum PitStopStatus {
	/** No mandatory pitstops */
	Unavailable = -1,

	/** Mandatory pitstop not served yet */
	Unserved = 0,

	/** Mandatory pitstop served */
	Served = 1
}

export enum EFinishStatus {
	/** N/A */
	Unavailable = -1,

	/** Still on track, not finished */
	None = 0,

	/** Finished session normally */
	Finished = 1,

	/** Did not finish */
	DNF = 2,

	/** Did not qualify */
	DNQ = 3,

	/** Did not start */
	DNS = 4,

	/** Disqualified */
	DQ = 5
}

export enum ESessionLengthFormat {
	/** N/A */
	Unavailable = -1,

	TimeBased = 0,

	LapBased = 1,

	/** Time and lap based session means there will be an extra lap
	 * after the time has run out */
	TimeAndLapBased = 2
}

export enum PitMenuSelection {
	// Pit menu unavailable
	Unavailable = -1,

	// Pit menu preset
	Preset = 0,

	// Pit menu actions
	Penalty = 1,
	Driverchange = 2,
	Fuel = 3,
	Fronttires = 4,
	Reartires = 5,
	Frontwing = 6,
	Rearwing = 7,
	Suspension = 8,

	// Pit menu buttons
	ButtonTop = 9,
	ButtonBottom = 10,

	// Pit menu nothing selected
	Max = 11
}

export enum ETireType {
	Unavailable = -1,
	Option = 0,
	Prime = 1
}

export enum ETireSubtype {
	Unavailable = -1,
	Primary = 0,
	Alternate = 1,
	Soft = 2,
	Medium = 3,
	Hard = 4
}

export enum EEngineType {
	Combustion = 0,
	Electric = 1,
	Hybrid = 2
}

export enum EPitState {
	None = -1,
	RequestedDtop = 1,
	Entered = 2,
	Pitting = 3,
	Exiting = 4
}

export enum EPenaltyType {
	Unavailable = -1,
	DriveThrough = 0,
	StopAndGo = 1,
	Pitstop = 2,
	Time = 3,
	Slowdown = 4,
	Disqualify = 5
}

export enum EOvertakingAid {
	Unavailable = -1,
	NotEngaged = 0,
	Engaged = 1
}

export interface IVector3 {
	X: number;
	Y: number;
	Z: number;
}

export interface IOrientation {
	Pitch: number;
	Yaw: number;
	Roll: number;
}

export interface ISectorStarts {
	Sector1: number;
	Sector2: number;
	Sector3: number;
}

export interface IPlayerData {
	/** Virtual physics time */
	/** Unit: Ticks (1 tick = 1/400th of a second) */
	GameSimulationTicks: number;

	/** Virtual physics time */
	/** Unit: Seconds */
	GameSimulationTime: number;

	/** Car world-space position */
	Position: IVector3;

	/** Car world-space velocity */
	/** Unit: Meter per second (m/s) */
	Velocity: IVector3;

	/** Car local-space velocity */
	/** Unit: Meter per second (m/s) */
	LocalVelocity: IVector3;

	/** Car world-space acceleration */
	/** Unit: Meter per second squared (m/s^2) */
	Acceleration: IVector3;

	/** Car local-space acceleration */
	/** Unit: Meter per second squared (m/s^2) */
	LocalAcceleration: IVector3;

	/** Car body orientation */
	/** Unit: Euler angles */
	Orientation: IVector3;

	/** Car body rotation */
	Rotation: IVector3;

	/** Car body angular acceleration (torque divided by inertia) */
	AngularAcceleration: IVector3;

	/** Car world-space angular velocity */
	/** Unit: Radians per second */
	AngularVelocity: IVector3;

	/** Car local-space angular velocity */
	/** Unit: Radians per second */
	LocalAngularVelocity: IVector3;

	/** Driver g-force local to car */
	LocalGforce: IVector3;

	/** Total steering force coming through steering bars */
	SteeringForce: number;
	SteeringForcePercentage: number;

	/** Current engine torque */
	EngineTorque: number;

	/** Current downforce */
	/** Unit: Newtons (N) */
	CurrentDownforce: number;

	/** Currently unused */
	Voltage: number;
	ErsLevel: number;
	PowerMguH: number;
	PowerMguK: number;
	TorqueMguK: number;

	/** Car setup (radians, meters, meters per second) */
	SuspensionDeflection: ITireData<number>;
	SuspensionVelocity: ITireData<number>;
	Camber: ITireData<number>;
	RideHeight: ITireData<number>;

	FrontWingHeight: number;
	FrontRollAngle: number;
	RearRollAngle: number;

	ThirdSpringSuspensionDeflectionFront: number;
	ThirdSpringSuspensionVelocityFront: number;
	ThirdSpringSuspensionDeflectionRear: number;
	ThirdSpringSuspensionVelocityRear: number;

	/** Reserved data */
	Unused1: number;
}

export interface IFlags {
	/** Whether yellow flag is currently active */
	/** -1 = no data */
	/**  0 = not active */
	/**  1 = active */
	Yellow: number;

	/** Whether yellow flag was caused by current slot */
	/** -1 = no data */
	/**  0 = didn't cause it */
	/**  1 = caused it */
	YellowCausedIt: number;

	/** Whether overtake of car in front by current slot is allowed */
	/** under yellow flag */
	/** -1 = no data */
	/**  0 = not allowed */
	/**  1 = allowed */
	YellowOvertake: number;

	/** Whether you have gained positions illegaly under yellow flag
	 *  to give back */
	/** -1 = no data */
	/**  0 = no positions gained */
	/**  n = number of positions gained */
	YellowPositionsGained: number;

	/** Yellow flag for each sector; -1 = no data, 0 = not active, 1 = active */
	SectorYellow: ISectors;

	/** Distance into track for closest yellow, -1.0 if no yellow flag exists */
	/** Unit: Meters (m) */
	ClosestYellowDistanceIntoTrack: number;

	/** Whether blue flag is currently active */
	/** -1 = no data */
	/**  0 = not active */
	/**  1 = active */
	Blue: number;

	/** Whether black flag is currently active */
	/** -1 = no data */
	/**  0 = not active */
	/**  1 = active */
	Black: number;

	/** Whether green flag is currently active */
	/** -1 = no data */
	/**  0 = not active */
	/**  1 = active */
	Green: number;

	/** Whether checkered flag is currently active */
	/** -1 = no data */
	/**  0 = not active */
	/**  1 = active */
	Checkered: number;

	/** Whether white flag is currently active */
	/** -1 = no data */
	/**  0 = not active */
	/**  1 = active */
	White: number;

	/** Whether black and white flag is currently active and reason */
	/** -1 = no data */
	/**  0 = not active */
	/**  1 = blue flag 1st warning */
	/**  2 = blue flag 2nd warning */
	/**  3 = wrong way */
	/**  4 = cutting track */
	BlackAndWhite: number;
}

export interface ICarDamage {
	/** Range: 0.0 - 1.0 */
	/** Note: -1.0 = N/A */
	Engine: number;

	/** Range: 0.0 - 1.0 */
	/** Note: -1.0 = N/A */
	Transmission: number;

	/** Range: 0.0 - 1.0 */
	/** Note: A bit arbitrary at the moment. 0.0 doesn't necessarily mean
	 * completely destroyed. */
	/** Note: -1.0 = N/A */
	Aerodynamics: number;

	/** Range: 0.0 - 1.0 */
	/** Note: -1.0 = N/A */
	Suspension: number;

	/** Reserved data */
	Unused1: number;
	Unused2: number;
}

export interface ITireData<T> {
	FrontLeft: T;
	FrontRight: T;
	RearLeft: T;
	RearRight: T;
}

export interface IPitMenuSelection {
	// Pit menu preset
	Preset: number;

	// Pit menu actions
	Penalty: number;
	DriverChange: number;
	Fuel: number;
	FrontTires: number;
	RearTires: number;
	FrontWing: number;
	RearWing: number;
	Suspension: number;

	// Pit menu buttons
	ButtonTop: number;
	ButtonBottom: number;
}

export interface ICutTrackPenalties {
	DriveThrough: number;
	StopAndGo: number;
	PitStop: number;
	TimeDeduction: number;
	SlowDown: number;
}

export interface IDrs {
	/** If DRS is equipped and allowed */
	/** 0 = No, 1 = Yes, -1 = N/A */
	Equipped: number;
	/** Got DRS activation left */
	/** 0 = No, 1 = Yes, -1 = N/A */
	Available: number;
	/** Number of DRS activations left this lap */
	/** Note: In sessions with 'endless' amount of drs activations per lap
	 * this value starts at :max: number */
	/** -1 = N/A */
	NumActivationsLeft: number;
	/** DRS engaged */
	/** 0 = No, 1 = Yes, -1 = N/A */
	Engaged: number;
}

export interface IPushToPass {
	Available: number;
	Engaged: number;
	AmountLeft: number;
	EngagedTimeLeft: number;
	WaitTimeLeft: number;
}

export interface ITireTemp {
	CurrentTemp: {
		Left: number;
		Center: number;
		Right: number;
	};
	OptimalTemp: number;
	ColdTemp: number;
	HotTemp: number;
}

export interface IBrakeTemp {
	CurrentTemp: number;
	OptimalTemp: number;
	ColdTemp: number;
	HotTemp: number;
}

export interface IAidSettings {
	/** ABS; -1 = N/A, 0 = off, 1 = on, 5 = currently active */
	Abs: number;
	/** TC; -1 = N/A, 0 = off, 1 = on, 5 = currently active */
	Tc: number;
	/** ESP; -1 = N/A, 0 = off, 1 = on low, 2 = on medium, 3 = on high, */
	/** 5 = currently active */
	Esp: number;
	/** Countersteer; -1 = N/A, 0 = off, 1 = on, 5 = currently active */
	Countersteer: number;
	/** Cornering; -1 = N/A, 0 = off, 1 = on, 5 = currently active */
	Cornering: number;
}

export interface ISectors {
	Sector1: number;
	Sector2: number;
	Sector3: number;
}

export interface IDriverInfo {
	Name: string;
	CarNumber: number;
	ClassId: number;
	ModelId: number;
	TeamId: number;
	LiveryId: number;
	ManufacturerId: number;
	UserId: number;
	SlotId: number;
	ClassPerformanceIndex: number;
	EngineType: EEngineType;

	Unused1: number;
	Unused2: number;
}

export interface IDriverData {
	DriverInfo: IDriverInfo;
	FinishStatus: EFinishStatus;
	Place: number;
	PlaceClass: number;
	LapDistance: number;
	Position: IVector3;
	TrackSector: number;
	CompletedLaps: number;
	CurrentLapValid: number;
	LapTimeCurrentSelf: number;
	SectorTimeCurrentSelf: ISectors;
	SectorTimePreviousSelf: ISectors;
	SectorTimeBestSelf: ISectors;
	TimeDeltaFront: number;
	TimeDeltaBehind: number;
	PitStopStatus: PitStopStatus;
	InPitlane: number;
	NumPitstops: number;
	Penalties: ICutTrackPenalties;
	CarSpeed: number;
	TireTypeFront: ETireType;
	TireTypeRear: ETireType;
	TireSubtypeFront: ETireSubtype;
	TireSubtypeRear: ETireSubtype;

	BasePenaltyWeight: number;
	AidPenaltyWeight: number;

	DrsState: EOvertakingAid;
	PtpState: EOvertakingAid;
	PenaltyType: EPenaltyType;

	// Based on the PenaltyType you can assume the reason is:

	// DriveThroughPenaltyInvalid = 0,
	// DriveThroughPenaltyCutTrack = 1,
	// DriveThroughPenaltyPitSpeeding = 2,
	// DriveThroughPenaltyFalseStart = 3,
	// DriveThroughPenaltyIgnoredBlue = 4,
	// DriveThroughPenaltyDrivingTooSlow = 5,
	// DriveThroughPenaltyIllegallyPassedBeforeGreen = 6,
	// DriveThroughPenaltyIllegallyPassedBeforeFinish = 7,
	// DriveThroughPenaltyIllegallyPassedBeforePitEntrance = 8,
	// DriveThroughPenaltyIgnoredSlowDown = 9,
	// DriveThroughPenaltyMax = 10

	// StopAndGoPenaltyInvalid = 0,
	// StopAndGoPenaltyCutTrack1st = 1,
	// StopAndGoPenaltyCutTrackMult = 2,
	// StopAndGoPenaltyYellowFlagOvertake = 3,
	// StopAndGoPenaltyMax = 4

	// PitstopPenaltyInvalid = 0,
	// PitstopPenaltyIgnoredPitstopWindow = 1,
	// PitstopPenaltyMax = 2

	// ServableTimePenaltyInvalid = 0,
	// ServableTimePenaltyServedMandatoryPitstopLate = 1,
	// ServableTimePenaltyIgnoredMinimumPitstopDuration = 2,
	// ServableTimePenaltyMax = 3

	// SlowDownPenaltyInvalid = 0,
	// SlowDownPenaltyCutTrack1st = 1,
	// SlowDownPenaltyCutTrackMult = 2,
	// SlowDownPenaltyMax = 3

	// DisqualifyPenaltyInvalid = -1,
	// DisqualifyPenaltyFalseStart = 0,
	// DisqualifyPenaltyPitlaneSpeeding = 1,
	// DisqualifyPenaltyWrongWay = 2,
	// DisqualifyPenaltyEnteringPitsUnderRed = 3,
	// DisqualifyPenaltyExitingPitsUnderRed = 4,
	// DisqualifyPenaltyFailedDriverChange = 5,
	// DisqualifyPenaltyThreeDriveThroughsInLap = 6,
	// DisqualifyPenaltyLappedFieldMultipleTimes = 7,
	// DisqualifyPenaltyIgnoredDriveThroughPenalty = 8,
	// DisqualifyPenaltyIgnoredStopAndGoPenalty = 9,
	// DisqualifyPenaltyIgnoredPitStopPenalty = 10,
	// DisqualifyPenaltyIgnoredTimePenalty = 11,
	// DisqualifyPenaltyExcessiveCutting = 12,
	// DisqualifyPenaltyIgnoredBlueFlag = 13,
	// DisqualifyPenaltyMax = 14
	PenaltyReason: number;

	/** Reserved data */
	Unused1: number;
	Unused2: number;
	Unused3: number;
	Unused4: number;
}

export default interface IShared {
	//////////////////////////////////////////////////////////////////////////
	/** Version */
	//////////////////////////////////////////////////////////////////////////
	VersionMajor: number;
	VersionMinor: number;
	AllDriversOffset: number /** Offset to NumCars variable */;
	DriverDataSize: number /** Size of DriverData */;

	//////////////////////////////////////////////////////////////////////////
	/** Game State */
	//////////////////////////////////////////////////////////////////////////

	GamePaused: number;
	GameInMenus: number;
	GameInReplay: number;
	GameUsingVr: number;

	GameUnused1: number;

	//////////////////////////////////////////////////////////////////////////
	/** High Detail */
	//////////////////////////////////////////////////////////////////////////

	/** High precision data for player's vehicle only */
	Player: IPlayerData;

	//////////////////////////////////////////////////////////////////////////
	/** Event And Session */
	//////////////////////////////////////////////////////////////////////////

	TrackName: string;
	LayoutName: string;

	TrackId: number;
	LayoutId: number;

	/** Layout length in meters */
	LayoutLength: number;
	SectorStartFactors: ISectorStarts;

	/** The current race event index, for championships with multiple events
	    Note: 0-indexed, -1 = N/A */
	EventIndex: number;

	/** Which session the player is in (practice, qualifying, race, etc.) */
	SessionType: ESession;

	/** The current iteration of the current type of session
	    (second qualifying session, etc.)
	    Note: 1-indexed, -1 = N/A */
	SessionIteration: number;

	/** If the session is time based, lap based or time based with
	    an extra lap at the end */
	SessionLengthFormat: number;

	/** Unit: Meter per second (m/s) */
	SessionPitSpeedLimit: number;

	/** Which phase the current session is in
	 * (gridwalk, countdown, green flag, etc.) */
	SessionPhase: ESessionPhase;

	/** Which phase start lights are in; -1 = unavailable, 0 = off,
	   1-5 = redlight on and counting down, 6 = greenlight on
	   Note: See the r3e_session_phase enum */
	StartLights: ESessionPhase;

	/** -1 = no data available */
	/**  0 = not active */
	/**  1 = active */
	/**  2 = 2x */
	/**  3 = 3x */
	/**  4 = 4x */
	TireWearActive: number;

	/** -1 = no data */
	/**  0 = not active */
	/**  1 = active */
	/**  2 = 2x */
	/**  3 = 3x */
	/**  4 = 4x */
	FuelUseActive: number;

	/** Total number of laps in the race, or -1 if player is not in race mode
	 * (practice, test mode, etc.) */
	NumberOfLaps: number;

	/** Amount of time remaining for the current session */
	/** Note: Only available in time-based sessions, -1.0 = N/A */
	/** Units: Seconds */
	SessionTimeDuration: number;
	SessionTimeRemaining: number;

	/** Reserved data */
	EventUnused1: number;
	EventUnused2: number;

	//////////////////////////////////////////////////////////////////////////
	/** Pit */
	//////////////////////////////////////////////////////////////////////////

	/** Current status of the pit stop */
	PitWindowStatus: EPitWindow;

	/** The minute/lap from which you're obligated to pit (-1 = N/A) */
	/** Unit: Minutes in time-based sessions, otherwise lap */
	PitWindowStart: number;

	/** The minute/lap into which you need to have pitted (-1 = N/A) */
	/** Unit: Minutes in time-based sessions, otherwise lap */
	PitWindowEnd: number;

	/** If current vehicle is in pitline (-1 = N/A) */
	InPitlane: number;

	/** What is currently selected in pit menu, and array of states
	 * (preset/buttons: -1 = not selectable,
	 * 1 = selectable) (actions: -1 = N/A,
	 * 0 = unmarked for fix,
	 * 1 = marked for fix)
	 * */
	PitMenuSelection: number;
	PitMenuState: IPitMenuSelection;

	/** Current vehicle pit state:
	 * -1 = N/A, 0 = None,
	 *  1 = Requested stop,
	 *	2 = Entered pitlane heading for pitspot,
	 *	3 = Stopped at pitspot,
	 *  4 = Exiting pitspot heading for pit exit)
	 */
	PitState: EPitState;

	/** Current vehicle pitstop actions duration */
	PitTotalDuration: number;
	PitElapsedTime: number;

	/** Current vehicle pit action: -1 = N/A,
	 * 0 = None,
	 * 1 = Preparing,
	 * (combination of 2 = Penalty serve,
	 * 4 = Driver change,
	 * 8 = Refueling,
	 * 16 = Front tires,
	 * 32 = Rear tires,
	 * 64 = Front wing,
	 * 128 = Rear wing,
	 * 256 = Suspension))
	 */
	PitAction: number;

	/** Number of pitstops the current vehicle has performed (-1 = N/A) */
	NumPitstopsPerformed: number;

	/** Reserved data */
	PitUnused1: number;
	PitUnused2: number;

	//////////////////////////////////////////////////////////////////////////
	/** Scoring & Timings */
	//////////////////////////////////////////////////////////////////////////

	/** The current state of each type of flag */
	Flags: IFlags;

	/** Current position (1 = first place) */
	Position: number;
	PositionClass: number;

	FinishStatus: EFinishStatus;

	/** Total number of cut track warnings (-1 = N/A) */
	CutTrackWarnings: number;

	/** The number of penalties the car currently has pending of
	 * each type (-1 = N/A) */
	Penalties: ICutTrackPenalties;
	/** Total number of penalties pending for the car */
	NumPenalties: number;

	/** How many laps the player has completed. If this value is 6,
	 * the player is on his 7th lap. -1 = n/a */
	CompletedLaps: number;
	CurrentLapValid: number;
	TrackSector: number;
	LapDistance: number;
	/** fraction of lap completed, 0.0-1.0, -1.0 = N/A */
	LapDistanceFraction: number;

	/** The current best lap time for the leader of the session (-1.0 = N/A) */
	LapTimeBestLeader: number;
	/** The current best lap time for the leader of the player's class in
	 * the current session (-1.0 = N/A) */
	LapTimeBestLeaderClass: number;
	/** Sector times of fastest lap by anyone in session */
	/** Unit: Seconds (-1.0 = N/A) */
	SectorTimesSessionBestLap: ISectors;
	/** Unit: Seconds (-1.0 = none) */
	LapTimeBestSelf: number;
	SectorTimesBestSelf: ISectors;
	/** Unit: Seconds (-1.0 = none) */
	LapTimePreviousSelf: number;
	SectorTimesPreviousSelf: ISectors;
	/** Unit: Seconds (-1.0 = none) */
	LapTimeCurrentSelf: number;
	SectorTimesCurrentSelf: ISectors;
	/** The time delta between the player's time and the leader of the
	 * current session (-1.0 = N/A) */
	LapTimeDeltaLeader: number;
	/** The time delta between the player's time and the leader of the
	 * player's class in the current session (-1.0 = N/A) */
	LapTimeDeltaLeaderClass: number;
	/** Time delta between the player and the car placed in front (-1.0 = N/A) */
	/** Units: Seconds */
	TimeDeltaFront: number;
	/** Time delta between the player and the car placed behind (-1.0 = N/A) */
	/** Units: Seconds */
	TimeDeltaBehind: number;
	// Time delta between this car's current laptime and this car's best laptime
	// Unit: Seconds (-1000.0 = N/A)
	TimeDeltaBestSelf: number;
	// Best time for each individual sector no matter lap
	// Unit: Seconds (-1.0 = N/A)
	BestIndividualSectorTimeSelf: ISectors;
	BestIndividualSectorTimeLeader: ISectors;
	BestIndividualSectorTimeLeaderClass: ISectors;

	/** Reserved data */
	ScoreUnused1: number;
	ScoreUnused2: number;
	ScoreUnused3: number;
	ScoreUnused4: number;

	//////////////////////////////////////////////////////////////////////////
	/** Vehicle information */
	//////////////////////////////////////////////////////////////////////////

	VehicleInfo: IDriverInfo;
	PlayerName: string;

	//////////////////////////////////////////////////////////////////////////
	/** Vehicle State */
	//////////////////////////////////////////////////////////////////////////

	/** Which controller is currently controlling the player's car
	 *  (AI, player, remote, etc.) */
	ControlType: EControl;

	/** Unit: Meter per second (m/s) */
	CarSpeed: number;

	/** Unit: Radians per second (rad/s) */
	EngineRps: number;
	MaxEngineRps: number;
	UpshiftRps: number;

	/** -2 = N/A, -1 = reverse, 0 = neutral, 1 = first gear, ... */
	Gear: number;
	/** -1 = N/A */
	NumGears: number;

	/** Physical location of car's center of gravity in world space
	 *  (X, Y, Z) (Y = up) */
	CarCgLocation: IVector3;
	/** Pitch, yaw, roll */
	/** Unit: Radians (rad) */
	CarOrientation: IOrientation;
	/** Acceleration in three axes (X, Y, Z) of car body in local-space. */
	/** From car center, +X=left, +Y=up, +Z=back. */
	/** Unit: Meter per second squared (m/s^2) */
	LocalAcceleration: IVector3;

	// Unit: Kilograms (kg)
	// Note: Car + penalty weight + fuel
	TotalMass: number;
	/** Unit: Liters (l) */
	/** Note: Fuel per lap show estimation when not enough data,
	 * then max recorded fuel per lap */
	/** Note: Not valid for remote players */
	FuelLeft: number;
	FuelCapacity: number;
	FuelPerLap: number;

	/** Unit: Celsius (C) */
	/** Note: Not valid for AI or remote players */
	EngineWaterTemp: number;
	EngineOilTemp: number;
	/** Unit: Kilopascals (KPa) */
	/** Note: Not valid for AI or remote players */
	FuelPressure: number;
	/** Unit: Kilopascals (KPa) */
	/** Note: Not valid for AI or remote players */
	EngineOilPressure: number;

	/** Unit: (Bar) */
	/** Note: Not valid for AI or remote players (-1.0 = N/A) */
	TurboPressure: number;

	/** How pressed the throttle pedal is */
	/** Range: 0.0 - 1.0 (-1.0 = N/A) */
	/** Note: Not valid for AI or remote players */
	Throttle: number;
	ThrottleRaw: number;
	/** How pressed the brake pedal is */
	/** Range: 0.0 - 1.0 (-1.0 = N/A) */
	/** Note: Not valid for AI or remote players */
	Brake: number;
	BrakeRaw: number;
	/** How pressed the clutch pedal is */
	/** Range: 0.0 - 1.0 (-1.0 = N/A) */
	/** Note: Not valid for AI or remote players */
	Clutch: number;
	ClutchRaw: number;
	/** How much the steering wheel is turned */
	/** Range: -1.0 - 1.0 */
	/** Note: Not valid for AI or remote players */
	SteerInputRaw: number;
	/** How many degrees in steer lock (center to full lock) */
	/** Note: Not valid for AI or remote players */
	SteerLockDegrees: number;
	/** How many degrees in wheel range (degrees full left to rull right) */
	/** Note: Not valid for AI or remote players */
	SteerWheelRangeDegrees: number;

	/** Aid settings */
	AidSettings: IAidSettings;

	/** DRS data */
	Drs: IDrs;

	/** Pit limiter (-1 = N/A, 0 = inactive, 1 = active) */
	PitLimiter: number;

	/** Push to pass data */
	PushToPass: IPushToPass;

	/** How much the vehicle's brakes are biased towards the back wheels
	 * (0.3 = 30%, etc.) (-1.0 = N/A) */
	/** Note: Not valid for AI or remote players */
	BrakeBias: number;

	/** Reserved data */
	VehicleUnused1: number;
	VehicleUnused2: number;
	VehicleUnused3: number;
	VehicleUnused4: number;
	VehicleUnused5: IOrientation;

	//////////////////////////////////////////////////////////////////////////
	/** Tires */
	//////////////////////////////////////////////////////////////////////////

	/** Rotation speed */
	/** Uint: Radians per second */
	TireRps: ITireData<number>;
	/** Wheel speed */
	/** Uint: Meters per second */
	TireSpeed: ITireData<number>;
	/** Range: 0.0 - 1.0 (-1.0 = N/A) */
	TireGrip: ITireData<number>;
	/** Range: 0.0 - 1.0 (-1.0 = N/A) */
	TireWear: ITireData<number>;
	// (-1 = N/A, 0 = false, 1 = true)
	TireFlatspot: ITireData<number>;
	/** Unit: Kilopascals (KPa) (-1.0 = N/A) */
	/** Note: Not valid for AI or remote players */
	TirePressure: ITireData<number>;
	/** Percentage of dirt on tire (-1.0 = N/A) */
	/** Range: 0.0 - 1.0 */
	TireDirt: ITireData<number>;
	/** Current temperature of three points across the tread
	of the tire (-1.0 = N/A) */
	/** Optimum temperature */
	/** Cold temperature */
	/** Hot temperature */
	TireTemp: ITireData<ITireTemp>;

	/** Which type of tires the car has (option, prime, etc.) */
	TireTypeFront: ETireType;
	TireTypeRear: ETireType;

	/** Which subtype of tires the car has */
	TireSubtypeFront: ETireSubtype;
	TireSubtypeRear: ETireSubtype;

	/** Current brake temperature (-1.0 = N/A) */
	/** Optimum temperature */
	/** Cold temperature */
	/** Hot temperature */
	/** Unit: Celsius (C) */
	/** Note: Not valid for AI or remote players */
	BrakeTemp: ITireData<IBrakeTemp>;

	/** Brake pressure (-1.0 = N/A) */
	/** Unit: Kilo Newtons (kN) */
	/** Note: Not valid for AI or remote players */
	BrakePressure: ITireData<number>;

	/** Reserved data */
	TireUnused1: number;
	TireUnused2: number;
	TireUnused3: number;
	TireUnused4: number;
	TireUnused5: ITireData<number>;

	// Tire load (N)
	// -1.0 = N/A
	TireLoad: ITireData<number>;
	//////////////////////////////////////////////////////////////////////////
	/** Damage */
	//////////////////////////////////////////////////////////////////////////

	/** The current state of various parts of the car */
	/** Note: Not valid for AI or remote players */
	CarDamage: ICarDamage;

	//////////////////////////////////////////////////////////////////////////
	/** Driver Info */
	//////////////////////////////////////////////////////////////////////////

	/** Number of cars (including the player) in the race */
	NumCars: number;

	/** Contains name and basic vehicle info for all drivers in place order */
	DriverData: IDriverData[];
}
