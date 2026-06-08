declare module 'src/main/resources/static/js/abcjs' {
	//
	// Enumerations
	//

	export type Clef = 'treble' | 'tenor' | 'bass' | 'alto' | 'treble+8' | 'tenor+8' | 'bass+8' | 'alto+8' | 'treble-8' | 'tenor-8' | 'bass-8' | 'alto-8' | 'none' | 'perc';

	export type Bar = 'bar_dbl_repeat' | 'bar_right_repeat' | 'bar_left_repeat' | 'bar_invisible' | 'bar_thick_thin' | 'bar_thin_thin' | 'bar_thin' | 'bar_thin_thick';

	export type MeterType = 'common_time' | 'cut_time' | 'specified' | 'tempus_perfectum' | 'tempus_imperfectum' | 'tempus_perfectum_prolatio' | 'tempus_imperfectum_prolatio';

	export type NoteLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

	export type AccidentalName = 'flat' | 'natural' | 'sharp' | 'dblsharp' | 'dblflat' | 'quarterflat' | 'quartersharp';

	export type ChordRoot = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

	export type KeyRoot = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'HP' | 'Hp' | 'none';

	export type KeyAccidentalName = '' | '#' | 'b';

	export type Mode = '' | 'm' | 'Dor' | 'Mix' | 'Loc' | 'Phr' | 'Lyd';

	export type ChordType = '' | 'm' | '7' | 'm7' | 'maj7' | 'M7' | '6' | 'm6' | 'aug' | '+' | 'aug7' | 'dim' | 'dim7' | '9' |
		'm9' | 'maj9' | 'M9' | '11' | 'dim9' | 'sus' | 'sus9' | '7sus4' | '7sus9' | '5';

	export type Placement = 'above' | 'below';

	export type ChordPlacement = 'above' | 'below' | 'left' | 'right' | 'default';

	export type BracePosition = "start" | "continue" | "end";

	export type Alignment = 'left' | 'center' |'right';

	export type Media = 'screen' | 'print';

	export type ProgressUnit = "seconds" | "beats" | "percent";

	export type NoteTimingEventType = "end" | "event";

	export type MidiOutputType = 'encoded' | 'binary' | 'link';

	export type Responsive = 'resize';

	export type DragTypes = 	"author" | "bar" | "brace" | "clef" | "composer" | "dynamicDecoration" | "ending" | "extraText" |
		"freeText" | "keySignature" | "note" | "part" | "partOrder" | "rhythm" | "slur" | "subtitle" | "tempo" | "timeSignature" | "title" |
		"unalignedWords" | "voiceName";

	export type FormatAttributes = "titlefont" | "gchordfont" | "composerfont" | "footerfont" | "headerfont" | "historyfont" | "infofont" |
		"measurefont" | "partsfont" | "repeatfont" | "subtitlefont" | "tempofont" | "textfont" | "voicefont" | "tripletfont" | "vocalfont" |
		"wordsfont" | "annotationfont" | "scale" | "partsbox" | "freegchord" | "fontboxpadding" | "stretchlast" | "tablabelfont" | "tabnumberfont" | "tabgracefont" | 'stafftopmargin';

	export type MidiCommands = "nobarlines" | "barlines" | "beataccents" | "nobeataccents" | "droneon" | "droneoff" | "noportamento" | "channel" | "c" |
		"drumon" | "drumoff" | "fermatafixed" | "fermataproportional" | "gchordon" | "gchordoff" | "bassvol" | "chordvol" | "bassprog" | "chordprog" |
		"controlcombo" | "temperamentnormal" | "gchord" | "ptstress" | "beatmod" | "deltaloudness" | "drumbars" | "pitchbend" |
		"gracedivider" | "makechordchannels" | "randomchordattack" | "chordattack" | "stressmodel" | "transpose" |
		"rtranspose" | "volinc" | "program" | "ratio" | "snt" | "bendvelocity" | "control" | "temperamentlinear" | "beat" | "beatstring" |
		"drone" | "drummap" | "portamento" | "expand" | "grace" | "trim" | "drum" | "chordname";

	export type StemDirection = 'up' | 'down' | 'auto' | 'none';

	export type NoteHeadType = 'normal' | 'harmonic' | 'rhythm' | 'x' | 'triangle';

	export type Decorations = "trill" | "trillh" | "lowermordent" | "uppermordent" | "mordent" | "pralltriller" | "accent" |
		"fermata" | "invertedfermata" | "tenuto" | "0" | "1" | "2" | "3" | "4" | "5" | "+" | "wedge" |
		"open" | "thumb" | "snap" | "turn" | "roll" | "irishroll" | "breath" | "shortphrase" | "mediumphrase" | "longphrase" |
		"segno" | "coda" | "D.S." | "D.C." | "fine" | "crescendo(" | "crescendo)" | "diminuendo(" | "diminuendo)" |"glissando(" | "glissando)" |
		"p" | "pp" | "f" | "ff" | "mf" | "mp" | "ppp" | "pppp" |  "fff" | "ffff" | "sfz" | "repeatbar" | "repeatbar2" | "slide" |
		"upbow" | "downbow" | "staccato" | "trem1" | "trem2" | "trem3" | "trem4" |
		"/" | "//" | "///" | "////" | "turnx" | "invertedturn" | "invertedturnx" | "arpeggio" | "trill(" | "trill)" | "xstem" |
		"mark" | "marcato" | "umarcato" |
		"D.C.alcoda" | "D.C.alfine" | "D.S.alcoda" | "D.S.alfine" | "editorial" | "courtesy"

	export type TablatureInstrument = 'guitar' | 'mandolin' | 'fiddle' | 'violin' | '';

	//
	// Basic types
	//
	export type Selector = string | Element

	type NumberFunction = () => number;

	export interface MeterFraction {
		num: number;
		den?: number;
	}

	export interface ClefProperties {
		stafflines?: number;
		staffscale?: number;
		transpose?: number;
		type: Clef;
		verticalPos: number;
		clefPos?: number;
	}

	export interface Meter {
		type: MeterType;
		value?: Array<MeterFraction>;
		beat_division?: Array<MeterFraction>;
	}

	export interface Accidental {
		acc: AccidentalName;
		note: NoteLetter;
		verticalPos: number;
	}

	export interface KeySignature {
		accidentals?: Array<Accidental>;
		root: KeyRoot;
		acc: KeyAccidentalName;
		mode: Mode;
	}

	export interface Font {
		face: string;
		size: number;
		weight: 'normal' | 'bold';
		style: 'normal' | 'italic';
		decoration: 'none' | 'underline';
	}

	export interface TempoProperties {
		duration?: Array<number>;
		bpm?: number;
		endChar: number;
		preString?: string;
		postString?: string;
		startChar: number;
		suppress?: boolean;
		suppressBpm?: boolean;
	}

	export interface TextFieldProperties {
		endChar?: number;
		font: Font;
		text: string;
		center?: boolean;
		startChar?: number;
	}

	export interface ChordProperties {
		name: string;
		chord: {
			root: ChordRoot;
			type: ChordType;
		},
		position?: ChordPlacement
		rel_position?: {
			x: number;
			y: number;
		}
	}

	export interface CharRange {
		startChar: number;
		endChar: number;
	}

	export type MidiParam = Array<string|number>;

	export type MidiGracePitches = Array<{instrument: number; pitch: number; volume: number; cents?: number; durationInMeasures: number}>;

	export interface MidiPitch {
		instrument: number;
		pitch: number;
		duration: number;
		volume: number;
		cents?: number;
		start: number;
		gap: number;
	}

	export type MidiPitches = Array<MidiPitch>;

	export interface RelativeElement {
		x: number;
		c: string;
		dx: number;
		w: number;
		pitch: number;
		pitch2?: number;
		scaleX: number;
		scaleY: number;
		type: string;
		name: string;
		linewidth?: number;
		klass?: string;
		anchor?: "start" | "middle" | "end";
		top: number;
		bottom: number;
		dim?: number;
		position?: number;
		realWidth?: number;
		partHeightAbove?: number;
		chordHeightAbove?: number;
		chordHeightBelow?: number;
		lyricHeightAbove?: number;
		lyricHeightBelow?: number;
	}

	export interface AbsoluteElement {
		abcelem : AbcElem;
		bottom : number;
		children : Array<RelativeElement>
		duration : number;
		durationClass : number;
		elemset : Array<SVGElement>
		extra : Array<RelativeElement>
		extraw : number;
		fixed : {w: number, t: number, b: number}
		heads : Array<RelativeElement>
		invisible : boolean;
		minspacing : number;
		notePositions : Array<{x:number; y:number;}>
		right : Array<RelativeElement>
		specialY : Array<{
			chordHeightAbove : number;
			chordHeightBelow : number;
			dynamicHeightAbove : number;
			dynamicHeightBelow : number;
			endingHeightAbove : number;
			lyricHeightAbove : number;
			lyricHeightBelow : number;
			partHeightAbove : number;
			tempoHeightAbove : number;
			volumeHeightAbove : number;
			volumeHeightBelow : number;
		}>
		top : number;
		tuneNumber : number;
		type : "symbol" | "tempo" | "part" | "rest" | "note" | "bar" | "staff-extra clef" | "staff-extra key-signature" | "staff-extra time-signature";
		w : number;
		x : number;
	}

	export type AbstractEngraver = any;

	export type NoteProperties = any; // TODO

	export type AudioTrackCommand = 'program' | 'text' | 'note';
	//
	// Input Types
	//

	//
	// 渲染参数 - renderAbc() 方法的配置选项
	//

	/**
	 * 乐谱换行配置
	 */
	export interface Wrap {
		/** 每行首选的小节数 */
		preferredMeasuresPerLine: number;
		/** 最小间距 */
		minSpacing: number;
		/** 最大间距 */
		maxSpacing: number;
		/** 最后一行的限制 */
		lastLineLimit?: number;
		/** 最小间距限制 */
		minSpacingLimit?: number;
	}

	/**
	 * 吉他/尤克里里指板配置
	 */
	export interface Tablature {
		/** 乐器类型：guitar(吉他), mandolin(曼陀林), fiddle/violin(小提琴) */
		instrument?: TablatureInstrument,
		/** 变调夹位置 */
		capo?: number
		/** 指板标签 */
		label?: string,
		/** 调音方式，如 ['E','A','D','G','B','E'] */
		tuning?: Array<string>,
		/** 最高音符 */
		highestNote?: string,
	}

	/**
	 * ABC 乐谱视觉渲染参数
	 * 用于控制乐谱的显示样式、交互功能等
	 */
	export interface AbcVisualParams {
		/** 重音记号是否显示在音符上方（默认下方） */
		accentAbove?: boolean;
		/** 是否为乐谱元素添加 CSS 类名，便于自定义样式 */
		add_classes?: boolean;
		/** 解析完成后的回调函数，可用于修改乐谱数据 */
		afterParsing?: AfterParsing;
		/** 无障碍标签，用于屏幕阅读器 */
		ariaLabel?: string;
		/** 和弦网格显示模式：'noMusic'(仅和弦) | 'withMusic'(带五线谱) */
		chordGrid?:'noMusic'|'withMusic';
		/** 点击乐谱元素时的回调函数 */
		clickListener?: ClickListener;
		/** 拖拽时的高亮颜色 */
		dragColor?: string;
		/** 是否启用拖拽编辑功能 */
		dragging?: boolean;
		/** 是否扩展到最宽的行 */
		expandToWidest?: boolean;
		/** 前景色（音符、谱线等的颜色） */
		foregroundColor?: string;
		/** 格式化配置，可设置字体、边距等 */
		format?: { [attr in FormatAttributes]?: any };
		/** 是否只渲染乐谱头部信息（不显示音符） */
		header_only?: boolean;
		/** 是否在每行开始显示谱号 */
		initialClef?: boolean;
		/** 是否使用爵士和弦标记（如 Cmaj7, Bb7 等） */
		jazzchords?: boolean;
		/** 是否使用德语字母标记音符（H 代替 B） */
		germanAlphabet?: boolean;
		/** 手动指定换行位置（字符索引数组） */
		lineBreaks?: Array<number>;
		/** 谱线粗细 */
		lineThickness?: number;
		/** 最小内边距 */
		minPadding?: number;
		/** 是否为每行生成独立的 SVG 元素 */
		oneSvgPerLine?: boolean;
		/** 底部内边距（像素） */
		paddingbottom?: number;
		/** 左侧内边距（像素） */
		paddingleft?: number;
		/** 右侧内边距（像素） */
		paddingright?: number;
		/** 顶部内边距（像素） */
		paddingtop?: number;
		/** 是否为打印优化（影响边距等） */
		print?: boolean;
		/** 响应式模式：'resize' 表示随容器大小调整 */
		responsive?: Responsive;
		/** 缩放比例（1.0 为原始大小） */
		scale?: number;
		/** 是否启用水平滚动 */
		scrollHorizontal?: boolean;
		/** 选中元素的高亮颜色 */
		selectionColor?: string;
		/** 可选择/拖拽的元素类型 */
		selectTypes?: boolean | Array<DragTypes>;
		/** 显示调试信息：'grid'(网格) | 'box'(边界框) */
		showDebug?: Array<"grid" | "box">;
		/** 谱表宽度（像素） */
		staffwidth?: number;
		/** 谱表顶部边距 */
		stafftopmargin?: number;
		/** 起始乐曲编号（用于 TuneBook） */
		startingTune?: number;
		/** 遇到警告时是否停止渲染 */
		stop_on_warning?: boolean;
		/** 指板配置数组 */
		tablature?: Array<Tablature>;
		/** 文本框内边距 */
		textboxpadding?: number;
		/** 基于时间的布局配置 */
		timeBasedLayout?: { minPadding?:number, minWidth?:number, align?: 'left'|'center'};
		/** 是否启用水平视口 */
		viewportHorizontal?: boolean;
		/** 是否启用垂直视口 */
		viewportVertical?: boolean;
		/** 视觉移调（半音数） */
		visualTranspose?: number;
		/** 换行配置 */
		wrap?: Wrap;
	}

	// TimingCallbacks
	export interface AnimationOptions {
		qpm?: number;
		extraMeasuresAtBeginning?: number;
		lineEndAnticipation?: number;
		beatSubdivisions?: number;
		beatCallback?: BeatCallback;
		eventCallback?: EventCallback;
		lineEndCallback?: LineEndCallback;
	}

	// Editor

	export interface EditorSynth {
		synthControl?: SynthObjectController;
		el: Selector;
		cursorControl?: CursorControl;
		options?: SynthOptions & SynthVisualOptions;
	}

	export interface EditorOptions {
		canvas_id?: Selector;
		paper_id?: Selector;
		generate_warnings?: boolean;
		warnings_id?: Selector;
		onchange?: OnChange;
		selectionChangeCallback?: SelectionChangeCallback;
		redrawCallback?: RedrawCallback;
		abcjsParams?: AbcVisualParams;
		indicate_changed?: boolean;
		synth?: EditorSynth;
	}

	/**
	 * 音频合成器配置选项
	 * 用于控制音乐播放的音色、音量、效果等
	 */
	export interface SynthOptions {
		/** 音色库 URL 地址 */
		soundFontUrl?: string;
		/** 音色库音量倍增器（0.0-1.0） */
		soundFontVolumeMultiplier?: number;
		/** 乐器程序偏移量映射 */
		programOffsets?: {[instrument: string]: number}
		/** 淡出长度（毫秒） */
		fadeLength?: number;
		/** 音序回调函数，可修改生成的音符序列 */
		sequenceCallback?: (sequence: Array<NoteMapTrack>, context: any) => Array<NoteMapTrack>;
		/** 回调函数的上下文对象 */
		callbackContext?: any; // Anything is ok. It is just passed back in the callback
		/** 播放结束时的回调函数 */
		onEnded?: (context: any) => void;
		/** 声道平衡数组（-1.0 左, 0.0 中, 1.0 右） */
		pan?: Array<number>;
		/** 是否关闭旋律声部，或指定要关闭的声部编号 */
		voicesOff?: boolean | Array<number>;
		/** 鼓点节奏模式字符串 */
		drum?: string;
		/** 鼓点重复的小节数 */
		drumBars?: number;
		/** 鼓点引入的小节数 */
		drumIntro?: number;
		/** 是否关闭鼓点 */
		drumOff?: boolean;
		/** MIDI 乐器程序号（0-127） */
		program?: number;
		/** MIDI 移调（半音数） */
		midiTranspose?: number;
		/** 视觉移调（半音数） */
		visualTranspose?: number;
		/** MIDI 通道号（0-15） */
		channel?: number;
		/** 每分钟节拍数（BPM） */
		qpm?: number;
		/** 默认 BPM（当乐谱未指定时） */
		defaultQpm?: number;
		/** 是否关闭和弦声音 */
		chordsOff?: boolean;
		/** 是否对八度音程进行去谐处理 */
		detuneOctave?: boolean;

		/** 摇摆节奏强度（0.0-1.0） */
		swing?: number;
		/** 低音乐器程序号 */
		bassprog?: number;
		/** 低音音量（0-127） */
		bassvol?: number;
		/** 和弦乐器程序号 */
		chordprog?: number;
		/** 和弦音量（0-127） */
		chordvol?: number;
		/** 吉他和弦伴奏模式 */
		gchord?: string;
	}

	/**
	 * 音频控制器视觉显示选项
	 * 控制播放界面上显示哪些控件
	 * 
	 * @deprecated 注意：这些选项用于 synthControl.load() 方法
	 * 如果需要显示时钟，应该在 CreateSynthControl() 中使用 hasClock 选项
	 */
	export interface SynthVisualOptions {
		/** 显示循环播放按钮 */
		displayLoop?: boolean;
		/** 显示重新开始按钮（回到开头） */
		displayRestart?: boolean;
		/** 显示播放/暂停按钮 */
		displayPlay?: boolean;
		/** 显示进度条 */
		displayProgress?: boolean;
		/** 显示速度调节控件（warp/speed control） */
		displayWarp?: boolean;
	}

	export type DownloadLabelFn = (visualObj: TuneObject, index: number) => string;

	export interface MidiFileOptions extends SynthOptions {
		midiOutputType?: MidiOutputType
		downloadClass?: string
		preTextDownload?: string
		downloadLabel?: string | DownloadLabelFn
		postTextDownload?: string
		fileName?: string
	}

	export interface MidiBufferOptions {
		audioContext? : AudioContext;
		visualObj?: TuneObject;
		sequence?: AudioSequence;
		millisecondsPerMeasure?: number;
		debugCallback? : (message: string) => void;
		options?: SynthOptions;
		onEnded?: (context: any) => void;
	}

	// Glyph
	export interface GlyphDef {
		d: Array<[string, ...number[]]>;
		w: number;
		h: number;
	}

	//
	// Return Types
	//

	// renderAbc
	export interface NoteTimingEvent {
		milliseconds: number;
		millisecondsPerMeasure: number;
		type: NoteTimingEventType;

		elements?: Array<Array<HTMLElement>>;
		endChar?: number;
		endCharArray?: Array<number>;
		endX?: number;
		height?: number;
		left?: number;
		line?: number;
		measureNumber?: number;
		midiPitches?: MidiPitches;
		midiGraceNotePitches?: MidiGracePitches;
		startChar?: number;
		startCharArray?: Array<number>;
		top?: number;
		width?: number;
		measureStart?: boolean;
	}

	// make an alias for backwards compatibility
	export interface TimingEvent extends NoteTimingEvent {

	}

	export interface PercMapElement {
		sound: number;
		noteHead: NoteHeadType;
	}

	export interface Formatting {
		alignbars?: number;
		aligncomposer?: Alignment;
		auquality?: string;
		bagpipes?: boolean;
		botmargin?: number;
		botspace?: number;
		bstemdown?: boolean;
		composerspace?: number;
		continueall?: boolean;
		continuous?: string;
		dynalign?: boolean;
		exprabove?: boolean;
		exprbelow?: boolean;
		flatbeams?: boolean;
		footer?: string;
		freegchord?: boolean;
		gchordbox?: boolean;
		graceSlurs?: boolean;
		gracespacebefore?: number;
		gracespaceinside?: number;
		gracespaceafter?: number;
		header?: string;
		indent?: number;
		infoline?: boolean;
		infospace?: number;
		leftmargin?: number;
		linesep?: number;
		lineskipfac?: number;
		map?: string;
		maxshrink?: number;
		maxstaffsep?: number;
		maxsysstaffsep?: number;
		measurebox?: boolean;
		midi?: {
			barlines?: MidiParam;
			bassprog?: MidiParam;
			bassvol?: MidiParam;
			beat?: MidiParam;
			beataccents?: MidiParam;
			beatmod?: MidiParam;
			beatstring?: MidiParam;
			bendvelocity?: MidiParam;
			c?: MidiParam;
			channel?: MidiParam;
			chordattack?: MidiParam;
			chordname?: MidiParam;
			chordprog?: MidiParam;
			chordvol?: MidiParam;
			control?: MidiParam;
			controlcombo?: MidiParam;
			deltaloudness?: MidiParam;
			drone?: MidiParam;
			droneoff?: MidiParam;
			droneon?: MidiParam;
			drum?: MidiParam;
			drumbars?: MidiParam;
			drummap: MidiParam;
			drumoff?: MidiParam;
			drumon?: MidiParam;
			expand?: MidiParam;
			fermatafixed?: MidiParam;
			fermataproportional?: MidiParam;
			gchord?: MidiParam;
			gchordon?: MidiParam;
			gchordoff?: MidiParam;
			grace?: MidiParam;
			gracedivider?: MidiParam;
			makechordchannels?: MidiParam;
			nobarlines?: MidiParam;
			nobeataccents?: MidiParam;
			noportamento?: MidiParam;
			pitchbend?: MidiParam;
			program?: MidiParam;
			portamento?: MidiParam;
			ptstress?: MidiParam;
			randomchordattack?: MidiParam;
			ratio?: MidiParam;
			rtranspose?: MidiParam;
			snt?: MidiParam;
			stressmodel?: MidiParam;
			temperamentlinear?: MidiParam;
			temperamentnormal?: MidiParam;
			transpose?: MidiParam;
			trim?: MidiParam;
			volinc: MidiParam;
		}
		musicspace?: number;
		nobarcheck?: string;
		notespacingfactor?: number;
		parskipfac?: number;
		partsbox?: boolean;
		partsspace?: number;
		percmap?: Array<PercMapElement>;
		playtempo?: string;
		rightmargin?: number;
		scale?: number;
		score?: string;
		slurheight?: number;
		splittune?: boolean;
		squarebreve?: boolean;
		staffsep?: number;
		staffwidth?: number;
		stemheight?: number;
		straightflags?: boolean;
		stretchlast?: number;
		stretchstaff?: boolean;
		subtitlespace?: number;
		sysstaffsep?: number;
		systemsep?: number;
		stafftopmargin?: number;
		textspace?: number;
		titleformat?: string;
		titleleft?: boolean;
		titlespace?: number;
		topmargin?: number;
		topspace?: number;
		vocalabove?: boolean;
		vocalspace?: number;
		wordsspace?: number;

		annotationfont: Font;
		composerfont: Font;
		footerfont: Font;
		gchordfont: Font;
		headerfont: Font;
		historyfont: Font;
		infofont: Font;
		measurefont: Font;
		pageheight: number;
		pagewidth: number;
		partsfont: Font;
		repeatfont: Font;
		subtitlefont: Font;
		tabgracefont: Font;
		tablabelfont: Font;
		tabnumberfont: Font;
		tempofont: Font;
		textfont: Font;
		titlefont: Font;
		tripletfont: Font;
		vocalfont: Font;
		voicefont: Font;
		wordsfont: Font;
	}

	// Caution: The contents of this object may change at any time. If you reference this, be sure you retest for each abcjs release.
	export interface EngraverController {
		classes: any;
		dragColor: string;
		dragIndex: number;
		dragMouseStart: { x: number, y: number; };
		dragTarget: null | any;
		dragYStep: number;
		dragging: boolean;
		engraver: AbstractEngraver;
		getFontAndAttr: any;
		getTextSize: any;
		listeners: [ClickListener];
		rangeHighlight: any;
		renderer: any;
		responsive?: boolean;
		scale: number;
		initialClef?: any;
		selectTypes: boolean | Array<DragTypes>;
		selectables: Array<Selectable>;
		selected: Array<any>;
		selectionColor: string;
		space: number;
		staffgroups: [any];
		staffwidthPrint: number;
		staffwidthScreen: number;
		width: number;
	}

	export interface MetaText {
		"abc-copyright"?: string;
		"abc-creator"?: string;
		"abc-version"?: string;
		"abc-charset"?: string;
		"abc-edited-by"?: string;
		author?: string;
		book?: string;
		composer?: string;
		decorationPlacement?: Placement;
		discography?: string;
		footer?: {
			left: string;
			center: string;
			right: string;
		};
		group?: string;
		header?: {
			left: string;
			center: string;
			right: string;
		}
		history?: string;
		instruction?: string;
		measurebox?: boolean;
		notes?: string;
		origin?: string;
		partOrder?: string;
		rhythm?: string;
		source?: string;
		tempo?: TempoProperties;
		textBlock?: string;
		title?: string;
		transcription?: string;
		unalignedWords?: Array<TextFieldProperties|string>;
		url?: string;
	}

	export interface MetaTextInfo {
		"abc-copyright": CharRange;
		"abc-creator": CharRange;
		"abc-version": CharRange;
		"abc-charset": CharRange;
		"abc-edited-by": CharRange;
		author: CharRange;
		book: CharRange;
		composer: CharRange;
		discography: CharRange;
		footer: CharRange;
		group: CharRange;
		header: CharRange;
		history: CharRange;
		instruction: CharRange;
		notes: CharRange;
		origin: CharRange;
		partOrder: CharRange;
		rhythm: CharRange;
		source: CharRange;
		tempo: CharRange;
		textBlock: CharRange;
		title: CharRange;
		transcription: CharRange;
		unalignedWords: CharRange;
		url: CharRange;
	}

	export interface VoiceItemClef {
		el_type: "clef";
		stafflines?: number;
		staffscale?: number;
		transpose?: number;
		type: Clef;
		verticalPos: number;
		clefPos?: number;
		startChar: number;
		endChar: number;
	}

	export interface VoiceItemBar {
		el_type: "bar";
		type: 'bar_dbl_repeat' | 'bar_right_repeat' | 'bar_left_repeat' |'bar_invisible' | 'bar_thick_thin' | 'bar_thin_thin' | 'bar_thin' | 'bar_thin_thick';
		barNumber?: number;
		chord?: Array<ChordProperties>;
		decoration: Array<Decorations>;
		endEnding?: boolean;
		startEnding?: string;
		startChar: number;
		endChar: number;
	}

	export interface VoiceItemGap {
		el_type: "gap";
		gap: number;
	}

	export interface VoiceItemKey extends KeySignature {
		el_type: "key";
		startChar: number;
		endChar: number;
	}

	export interface VoiceItemMeter extends Meter {
		el_type: "meter";
		startChar: number;
		endChar: number;
	}

	export interface VoiceItemMidi {
		el_type: "midi";
		cmd: MidiCommands;
		params: Array<string|number>;
		startChar: number;
		endChar: number;
	}

	export interface VoiceItemOverlay {
		el_type: "overlay";
		startChar: number;
		endChar: number;
		overlay: Array<NoteProperties>;
	}

	export interface VoiceItemPart {
		el_type: "part";
		startChar: number;
		endChar: number;
		title: string;
	}

	export interface VoiceItemScale {
		el_type: "scale";
		size: number;
	}

	export interface VoiceItemStem {
		el_type: "stem";
		direction: StemDirection;
	}

	export interface VoiceItemStyle {
		el_type: "style";
		head: NoteHeadType;
	}

	export interface VoiceItemTempo extends TempoProperties {
		el_type: "tempo";
		startChar: number;
		endChar: number;
	}

	export interface VoiceItemTranspose {
		el_type: "transpose";
		steps: number;
	}

	export interface VoiceItemNote extends NoteProperties {
		el_type: "note";
		startChar: number;
		endChar: number;
		duration: number;
		pitches?: Array<any>; // TODO-PER
		rest?: { type: 'rest' | 'spacer' | 'invisible' | 'invisible-multimeasure' | 'multimeasure', text? : number};
	}
	export type VoiceItem = VoiceItemClef | VoiceItemBar | VoiceItemGap | VoiceItemKey | VoiceItemMeter | VoiceItemMidi | VoiceItemOverlay | VoiceItemPart | VoiceItemScale | VoiceItemStem | VoiceItemStyle | VoiceItemTempo | VoiceItemTranspose | VoiceItemNote;

	export interface TuneLine {
		columns?: { formatting: any, lines: any };
		image?: string;
		newpage?: number;
		staffbreak?: number;
		// Only one of separator, subtitle, text, or staff will be present
		separator?: {
			endChar: number;
			lineLength?: number;
			spaceAbove?: number;
			spaceBelow?: number;
			startChar: number;
		};
		subtitle?: {
			endChar: number;
			startChar: number;
			text: string;
		};
		text?: {
			endChar: number;
			startChar: number;
			text: TextFieldProperties;
		};
		staff?: Array<{
			clef?: ClefProperties;
			key?: KeySignature;
			meter?: Meter;
			voices?: Array<Array<VoiceItem>>;
		}>;
		staffGroup?: {
			barNumber?: number;
			brace?: BracePosition;
			bracket?: BracePosition;
			connectBarLines?: BracePosition;
			gchordfont?: Font;
			tripletfont?: Font;
			vocalfont?: Font;
			spacingAbove?: number;
			spacingBelow?: number;
			stafflines?: number;
			staffscale?: number;
			title?: Array<string>;
			height?:number;
			line?: number;
			startx?:number;
			w?:number;
			gridStart?:number;
			gridEnd?:number;
		};
		vskip?: number;
	}

	export interface Selectable {
		absEl: AbsoluteElement;
		isDraggable: boolean;
		staffPos: {
			height: number;
			top: number;
			zero: number;
		}
		svgEl: SVGElement;
	}

	export interface SelectableReturn {
		index: number;
		classes: Array<string>;
		element: Selectable;
		analysis: {
			staffPos: number;
			name: string;
			voice: number;
			line: number;
			measure: number;
			selectableElement: HTMLElement;
		}
	}

	interface ChordGridSubtitle {
		type: "subtitle";
		subtitle: string;
	}
	interface ChordGridText {
		type: "text";
		text: string;
	}
	interface ChordGridMeasure {
		chord: [string,string,string,string];
		hasStartRepeat?:boolean;
		hasEndRepeat?:boolean;
		noBorder?:boolean; // for when the line isn't complete, this is a placeholder
		ending?:number; // This bar starts an ending
		annotations?: Array<string>;
	}
	interface ChordGridPart {
		type: "part";
		name: string;
		lines: Array<ChordGridMeasure>;
	}
	type ChordGrid = ChordGridSubtitle | ChordGridText | ChordGridPart;

	export interface TuneObject {
		formatting: Formatting;
		engraver?: EngraverController;
		lines: Array<TuneLine>;
		media: Media;
		metaText: MetaText;
		metaTextInfo: MetaTextInfo;
		version: string;
		warnings?: Array<string>;
		chordGrid?: Array<ChordGrid>;

		getTotalTime: NumberFunction;
		getTotalBeats: NumberFunction;
		getBarLength: NumberFunction;
		getBeatLength: NumberFunction;
		getBeatsPerMeasure: NumberFunction;
		getBpm: (tempo?:TempoProperties) => number;
		getMeter: () => Meter;
		getMeterFraction: () => MeterFraction;
		getPickupLength: NumberFunction;
		getKeySignature: () => KeySignature;
		getElementFromChar: (charPos: number) => VoiceItem | null;
		millisecondsPerMeasure: (bpm?: number) => number;
		setTiming: (bpm?: number, measuresOfDelay? : number) => void;
		setupEvents: (startingDelay: number, timeDivider:number, startingBpm: number, warp?: number) => Array<NoteTimingEvent>;
		setUpAudio: (options: SynthOptions) => AudioTracks;
		makeVoicesArray: () => Array<Selectable[]>
		deline: () => Array<TuneLine>;
		findSelectableElement: (target: HTMLElement) => SelectableReturn | null;
		getSelectableArray: () => Array<Selectable>
		lineBreaks?: Array<number>;
		visualTranspose?: number;
	}

	export type TuneObjectArray = [TuneObject]

	export interface AbcElem {
		el_type: string; //TODO enumerate these
		abselem: AbsoluteElement;
		beambr?: number;
		chord?: Array<{name: string; position: ChordPlacement}>
		decoration: Array<string> //TODO enumerate these
		duration: number
		endBeam?: boolean
		endSlur?: number
		endTriplet?: true
		gracenotes?: Array<{duration: number; name:string; pitch: number; verticalPosition: number;}>
		lyric?: Array<{syllable: string; divider: ' ' | '-' | '_';}>
		noStem?: boolean
		midiPitches?: MidiPitches;
		midiGraceNotePitches?: MidiGracePitches;
		pitches?: Array<{
			pitch: number;
			name: string;
			startSlur?: Array<{label: number}>;
			endSlur?: Array<number>;
			startTie?: {};
			endTie?: boolean;
			verticalPos: number;
			highestVert: number;
		}>
		positioning?: any
		rest?: {"type": "rest"}
		startBeam?: boolean
		startTriplet?: number
		tripletMultiplier?: number
		tripletR?: number
		stemConnectsToAbove?: true
		style?: NoteHeadType
		startChar: number
		endChar: number
	}

	export interface ClickListenerDrag {
		step: number;
		max: number;
		index: number;
		setSelection: (index: number) => void;
	}

	export interface ClickListenerAnalysis {
		staffPos: number;
		name: string;
		clickedName: string;
		parentClasses: Array<string>;
		clickedClasses: Array<string>;
		voice: number;
		line: number;
		measure: number;
		selectableElement: HTMLElement;
	}

	// TimingCallbacks
	export interface LineEndInfo {
		milliseconds: number;
		top: number;
		bottom: number;
	}

	export interface LineEndDetails {
		line: number;
		endTimings: Array<LineEndInfo>;
	}

	export interface TimingCallbacksPosition {
		top: number;
		left: number;
		height: number
	}

	export interface TimingCallbacksDebug {
		timestamp: number;
		startTime: number;
		ev: NoteTimingEvent;
		endMs: number;
		offMs: number;
		offPx: number;
		gapMs: number;
		gapPx: number;
	}

	// Audio
	export interface SequenceInstrument {
		el_type: "instrument";
		program: number;
		pickupLength: number;
	}

	export interface SequenceChannel {
		el_type: "channel";
		channel: number;
	}

	export interface SequenceTranspose {
		el_type: "transpose";
		transpose: number;
	}

	export interface SequenceName {
		el_type: "name";
		trackName: string;
	}

	export interface SequenceDrum {
		el_type: "drum";
		pattern: string;
		on: boolean;
		bars?: number;
		intro?: number;
	}

	export interface SequenceTempo {
		el_type: "tempo";
		qpm: number;
	}

	export interface SequenceKey {
		el_type: "key";
		accidentals: Array<Accidental>;
	}

	export interface SequenceBeat {
		el_type: "beat";
		beats: [number,number,number];
	}

	export interface SequenceBeatAccents {
		el_type: "beataccents";
		value: boolean;
	}

	export interface SequenceBagpipes {
		el_type: "bagpipes";
	}

	export interface SequenceNote {
		el_type: "note";
		duration: number;
		elem: AbsoluteElement;
		pitches: {pitch: number; name: NoteLetter};
		timing: number;
	}

	export type AudioSequenceElement = SequenceInstrument | SequenceChannel | SequenceTranspose | SequenceName | SequenceDrum | SequenceTempo | SequenceKey | SequenceBeat | SequenceBeatAccents | SequenceBagpipes | SequenceNote;

	export type AudioSequenceVoice = Array<AudioSequenceElement>;

	export type AudioSequence = Array<AudioSequenceVoice>;

	export type MidiFile = any // This is a standard midi file format

	export interface MidiBufferPromise {
		cached: Array<string>;
		error: Array<string>;
		loaded: Array<string>;
	}

	export interface AudioTrackProgramItem {
		cmd: 'program';
		channel: number;
		instrument: number;
	}

	export interface AudioTrackNoteItem {
		cmd: 'note';
		duration: number;
		endChar: number;
		endType?: "staccato"|"tenuto";
		gap: number;
		instrument: number;
		pitch: number;
		start: number;
		startChar: number;
		volume: number;
	}
	export interface AudioTrackTextItem {
		cmd: 'text';
		type: 'name';
		text: string;
	}
	export type AudioTrack = Array<AudioTrackProgramItem|AudioTrackNoteItem|AudioTrackTextItem>

	export interface AudioTracks {
		tempo: number;
		instrument: number;
		tracks: Array<AudioTrack>;
		totalDuration: number;
	}

	// Analysis
	export interface AnalyzedTune {
		abc: string;
		id: string;
		pure: string;
		startPos: number;
		title: string;
	}

	export interface MeasureDef {
		abc: string;
		startEnding?: string;
		endEnding?: true;
	}

	export interface MeasureList {
		header: string;
		measures: Array<MeasureDef>;
		hasPickup: boolean
	}


	//
	// Callbacks
	//

	// renderAbc
	export type ClickListener = (abcElem: AbcElem, tuneNumber: number, classes: string, analysis: ClickListenerAnalysis, drag: ClickListenerDrag) => void;

	export type AfterParsing = (tune: TuneObject, tuneNumber: number, abcString: string) => TuneObject;

	// TimingCallbacks
	export type BeatCallback = (beatNumber: number, totalBeats: number, totalTime: number, position: TimingCallbacksPosition, debugInfo: TimingCallbacksDebug) => void;

	type EventCallbackReturn = "continue" | Promise<"continue"> | undefined

	export type EventCallback = (event: NoteTimingEvent | null) => EventCallbackReturn;

	export type LineEndCallback = (info : LineEndInfo, event: NoteTimingEvent, details: LineEndDetails) => void;

	// Editor
	export type OnChange = (editor: Editor) => void;

	export type SelectionChangeCallback = (startChar: number, endChar: number) => void;

	export type RedrawCallback = (isBefore: boolean) => void;

	/**
	 * 游标控制器接口
	 * 用于在播放时高亮显示当前音符，实现卡拉 OK 式跟随效果
	 */
	export interface CursorControl {
		/** 节拍细分数量（默认为 2） */
		beatSubDivision?: number

		/** 音频引擎准备就绪时调用 */
		onReady?(): void
		/** 播放开始时调用 */
		onStart?(): void
		/** 播放结束时调用 */
		onFinished?(): void
		/** 每个节拍时调用 */
		onBeat?(beatNumber: number, totalBeats: number, totalTime: number): void
		/** 每个音符事件时调用，用于更新游标位置和高亮 */
		onEvent?(event: NoteTimingEvent): void
	}

	//
	// Visual
	//
	let signature: string;

	/**
	 * 渲染 ABC 乐谱为 SVG 五线谱
	 * @param target - 目标容器（CSS 选择器或 DOM 元素）
	 * @param code - ABC 格式的乐谱字符串
	 * @param params - 渲染参数配置
	 * @returns 渲染后的乐谱对象数组
	 * 
	 * @example
	 * ```javascript
	 * const visualObjs = ABCJS.renderAbc("paper", "X:1\nT:小星星\nK:C\nC C G G|A A G2|]");
	 * ```
	 */
	export function renderAbc(target: Selector, code: string, params?: AbcVisualParams): TuneObjectArray

	export function tuneMetrics(code: string, params?: AbcVisualParams): Array<{sections: Array<{left: number, measureWidths:Array<number>, total: number}>}>

	/**
	 * 解析 ABC 乐谱但不渲染（仅用于分析）
	 * @param abc - ABC 格式的乐谱字符串
	 * @param params - 解析参数
	 * @returns 解析后的乐谱对象数组
	 */
	export function parseOnly(abc: string, params?: AbcVisualParams) : TuneObjectArray

	//
	// Animation
	//
	/**
	 * 定时回调类
	 * 用于实现乐谱播放时的动画效果和音符高亮跟随
	 * 
	 * @example
	 * ```javascript
	 * const timingCallbacks = new ABCJS.TimingCallbacks(visualObj, {
	 *   eventCallback: (event) => {
	 *     // 更新游标位置
	 *   }
	 * });
	 * timingCallbacks.start();
	 * ```
	 */
	export class TimingCallbacks {
		constructor(visualObj: TuneObject, options?: AnimationOptions) ;
		/** 替换目标乐谱对象 */
		replaceTarget(visualObj: TuneObject): void;
		/** 开始播放动画 */
		start(position?: number, units?: ProgressUnit) : void;
		/** 暂停播放 */
		pause() : void;
		/** 重置到开始位置 */
		reset() : void;
		/** 停止播放 */
		stop() : void;
		/** 设置播放进度 */
		setProgress(position: number, units?: ProgressUnit ) : void;
		/** 获取当前时间（毫秒） */
		currentMillisecond(): number;

		/** 音符时序数组 */
		noteTimings: Array<NoteTimingEvent>;
	}

	//
	// Editor
	//
	export class EditArea {
		constructor(target: Selector);
	}

	export class Editor {
		constructor(target: Selector | EditArea, options: EditorOptions);
		paramChanged(options: AbcVisualParams): void;
		synthParamChanged(options: SynthOptions): void;
		setNotDirty(): void;
		isDirty(): boolean;
		pause(shouldPause: boolean): void;
		millisecondsPerMeasure(): number;
		pauseMidi(shouldPause: boolean): void;
		fireChanged():void;
		getTunes():TuneObjectArray;
	}

	//
	// Audio
	//
	/**
	 * 音频控制器接口
	 * 提供播放控制、进度管理等功能
	 */
	export interface AudioControl {
		/** 禁用/启用控制器 */
		disable: (isDisabled: boolean) => void;
		/** 设置速度（tempo: BPM, warp: 倍速百分比） */
		setWarp: (tempo: number, warp: number) => void;
		/** 设置 tempo（BPM） */
		setTempo: (tempo: number) => void;
		/** 重置所有设置 */
		resetAll: () => void;
		/** 切换播放/暂停状态 */
		pushPlay: (push: boolean) => void;
		/** 切换循环播放状态 */
		pushLoop: (push: boolean) => void;
		/** 设置进度（percent: 0-100, totalTime: 总时长秒数） */
		setProgress: (percent: number, totalTime: number) => void;
	}

	/**
	 * MIDI 缓冲区接口
	 * 用于管理和播放音频数据
	 */
	export interface MidiBuffer {
		/** 初始化音频引擎 */
		init(params?: MidiBufferOptions): Promise<MidiBufferPromise>
		/** 预加载音频数据 */
		prime(): Promise<{ status: string, duration: number}>
		/** 开始播放 */
		start(): void
		/** 暂停播放，返回当前时间（秒） */
		pause(): number
		/** 恢复播放 */
		resume(): void
		/** 跳转到指定位置 */
		seek(position: number, units?: ProgressUnit): void
		/** 停止播放，返回当前时间（秒） */
		stop(): number
		/** 下载音频为 WAV 格式（返回 blob 引用） */
		download(): string // returns audio buffer in wav format as a reference to a blob
		/** 获取播放状态 */
		getIsRunning(): boolean
		/** 获取 AudioBuffer 对象 */
		getAudioBuffer(): AudioBuffer | undefined
	}

	export interface SynthInitResponse {
		status: "no-audio-context" | "created";
		loadingResponse?: {
			cached: Array<string>
			error: Array<string>
			loaded: Array<string>
		}
	}

	/**
	 * 合成器控制器接口
	 * 提供完整的音频播放控制功能，包括播放、暂停、循环、进度等
	 */
	export interface SynthObjectController {
		/** 禁用/启用控制器 */
		disable(isDisabled: boolean): void
		/**
		 * 设置要播放的乐谱
		 * @param visualObj - 渲染后的乐谱对象
		 * @param userAction - 是否为用户操作触发
		 * @param audioParams - 音频参数配置
		 */
		setTune(visualObj: TuneObject, userAction: boolean, audioParams?: SynthOptions): Promise<SynthInitResponse>
		/**
		 * 加载音频控制器到指定 DOM 元素
		 * @param selector - CSS 选择器或 DOM 元素
		 * @param cursorControl - 游标控制器（用于高亮跟随）
		 * @param visualOptions - 视觉显示选项
		 */
		load(selector: Selector, cursorControl?: CursorControl | null, visualOptions?: SynthVisualOptions): void
		/** 开始/恢复播放 */
		play(): void
		/** 暂停播放 */
		pause(): void
		/** 切换循环播放 */
		toggleLoop(): void
		/** 重新开始播放 */
		restart(): void
		/** 设置播放进度（0-1） */
		setProgress(ev: number): void
		/** 设置速度倍率（1.0 为原速） */
		setWarp(percent: number): Promise<void>
		/** 下载音频文件 */
		download(fName: string): void
		/** 获取 AudioBuffer 对象 */
		getAudioBuffer(): AudioBuffer | undefined
	}

	export interface SynthSequenceClass {
		addTrack(): AudioTrack
		setInstrument(trackNumber: number, instrumentNumber: number): void
		appendNote(trackNumber: number, pitch: number, durationInMeasures: number, volume: number, cents: number): void
	}

	export interface MidiRenderer {
		setTempo(bpm: number): void
		setGlobalInfo(bpm: number, name: string, key:KeySignature, time:MeterFraction): void
		startTrack(): void
		endTrack(): void
		setText(type: string, text: string):void
		setInstrument(instrument: number):void
		setChannel(channel:number, pan?: number):void
		startNote(pitch:number, loudness:number, cents?:number):void
		endNote(pitch:number):void
		addRest(length:number):void

		getData():string
		embed(parent:Element, noplayer:boolean):void
	}

	/**
	 * 合成器控制 UI 创建选项
	 * 用于 ABCJS.synth.CreateSynthControl() 函数
	 */
	export interface SynthControlOptions {
		/** AudioContext 实例 */
		ac?: AudioContext;
		/** 恢复后的回调函数 */
		afterResume?: () => void;
		/** 循环按钮点击处理函数 */
		loopHandler?: (ev: any) => Promise<void>;
		/** 重新开始按钮点击处理函数 */
		restartHandler?: (ev: any) => Promise<void>;
		/** 播放按钮点击处理函数 */
		playHandler?: (ev: any) => Promise<void>;
		/** 播放 Promise 处理函数 */
		playPromiseHandler?: (ev: any) => Promise<void>;
		/** 进度条处理函数 */
		progressHandler?: (ev: any) => Promise<void>;
		/** 速度调节处理函数 */
		warpHandler?: (ev: any) => Promise<void>;
		/** 是否显示时钟/时间显示 */
		hasClock?: boolean;
		/** 循环按钮标题文本 */
		repeatTitle?: string;
		/** 循环按钮无障碍标签 */
		repeatAria?: string;
		/** 重新开始按钮标题文本 */
		restartTitle?: string;
		/** 重新开始按钮无障碍标签 */
		restartAria?: string;
		/** 播放按钮标题文本 */
		playTitle?: string;
		/** 播放按钮无障碍标签 */
		playAria?: string;
		/** 随机播放按钮标题文本 */
		randomTitle?: string;
		/** 随机播放按钮无障碍标签 */
		randomAria?: string;
		/** 速度调节按钮标题文本 */
		warpTitle?: string;
		/** 速度调节按钮无障碍标签 */
		warpAria?: string;
		/** BPM 显示文本 */
		bpm?: string;
	}

	/**
	 * 音频合成命名空间
	 * 包含音频播放相关的类和函数
	 */
	export namespace synth {
		/** 乐器索引到名称的映射数组 */
		let instrumentIndexToName: [string]
		/** 音高到音符名称的映射数组 */
		let pitchToNoteName: [string]
		/** 合成器控制器类 - 提供完整的播放控制 UI */
		let SynthController: { new (): SynthObjectController }
		/** 创建合成器类 - 用于底层音频控制 */
		let CreateSynth: { new (): MidiBuffer }
		/** 音序器类 - 用于生成 MIDI 序列 */
		let SynthSequence: { new (): SynthSequenceClass }

		/** 检查浏览器是否支持 Web Audio API */
		export function supportsAudio(): boolean
		/** 注册 AudioContext（可选，用于共享音频上下文） */
		export function registerAudioContext(ac?: AudioContext): boolean
		/** 获取当前活动的 AudioContext */
		export function activeAudioContext(): AudioContext
		/** 创建合成器控制 UI 元素 */
		export function CreateSynthControl(element: Selector, options?: SynthControlOptions): AudioControl
		/** 将乐谱转换为 MIDI 文件 */
		export function getMidiFile(source: string | TuneObject, options?: MidiFileOptions): MidiFile;
		/** 播放单个音符事件（低级 API） */
		export function playEvent(pitches: MidiPitches, graceNotes: MidiGracePitches | undefined, milliSecondsPerMeasure: number, soundFontUrl? : string, debugCallback?: (message: string) => void): Promise<void>;
		/** 生成音频序列 */
		export function sequence(visualObj: TuneObject, options: AbcVisualParams): AudioSequence
		/** 创建 MIDI 渲染器 */
		export function midiRenderer(): MidiRenderer
	}

	//
	// Analysis
	//
	export class TuneBook {
		constructor(tunebookString: string) ;
		getTuneById(id: string | number): AnalyzedTune;
		getTuneByTitle(id: string): AnalyzedTune;

		header: string;
		tunes: Array<AnalyzedTune>;
	}

	export function numberOfTunes(abc: string) : number;
	export function extractMeasures(abc: string) : Array<MeasureList>;
	
	export function strTranspose(originalAbc: string, visualObj: TuneObjectArray, steps: number): string;

	//
	// Glyph
	//
	export function setGlyph(glyphName: string, glyph: GlyphDef) : void;
}
