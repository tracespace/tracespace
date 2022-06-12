// common constants

// filetype constants
export const GERBER = 'gerber'
export const DRILL = 'drill'

// units constants
export const MM = 'mm'
export const IN = 'in'

// format constants
export const LEADING = 'leading'
export const TRAILING = 'trailing'
export const ABSOLUTE = 'absolute'
export const INCREMENTAL = 'incremental'

// tool constants
export const CIRCLE = 'circle'
export const RECTANGLE = 'rectangle'
export const OBROUND = 'obround'
export const POLYGON = 'polygon'
export const MACRO_SHAPE = 'macroShape'

// macro primitive codes
export const MACRO_CIRCLE = '1'
export const MACRO_VECTOR_LINE = '20'
export const MACRO_CENTER_LINE = '21'
export const MACRO_OUTLINE = '4'
export const MACRO_POLYGON = '5'
export const MACRO_MOIRE = '6'
export const MACRO_THERMAL = '7'

// drawing constants
export const SHAPE = 'shape'
export const MOVE = 'move'
export const SEGMENT = 'segment'
export const SLOT = 'slot'

// interpolation / routing constants
export const LINE = 'line'
export const CW_ARC = 'cwArc'
export const CCW_ARC = 'ccwArc'
export const ABSOLUTE_MODE = 'absoluteMode' // NC Drill G90
export const INCREMENTAL_MODE = 'incrementalMode' // NC Drill G91

// quadrant mode
export const SINGLE = 'single'
export const MULTI = 'multi'

// drill mode
export const DRILL_MODE = 'drillMode' // G05

// drill absolute mode
export const DRILL_ABSOLUTE_MODE = 'drillAbsoluteMode' // G90

// Z-axis route
export const DRILL_Z_AXIS_ROUTE_DEPTH = 'drillZAxisRouteDepth' // M14
export const DRILL_Z_AXIS_ROUTE_POSITION = 'drillZAxisRoutePosition' // M15


// Retracting
export const DRILL_RETRACT_WITH_CLAMPING = 'drillRetractWithClamping' // M16
export const DRILL_RETRACT_NO_CLAMPING = 'drillRetractNoClamping' // M17

// tool tip chek
export const DRILL_TOOL_TIP_CHECK = 'drillToolTipCheck' // M18

// reference scaling
export const DRILL_REF_SCALE_ON = 'drillRefScaleOn' // M60
export const DRILL_REF_SCALE_OFF = 'drillRefScaleOff' // M61

export const DRILL_PECK_ON = 'drillPeckOn' // M62
export const DRILL_PECK_OFF = 'drillPeckOff' // M63

// drill measuring modes
export const DRILL_METRIC_MEASURE_MODE = 'drillMetricMeasureMode' // M71
export const DRILL_INCH_MEASURE_MODE = 'drillInchMeasureMode' // M72

// drill mirror image
export const DRILL_MIRROR_IMAGE_X = 'drillMirrorImageX' // M80
export const DRILL_MIRROR_IMAGE_Y = 'drillMirrorImageY' // M90

// load polarity
export const DARK = 'dark'
export const CLEAR = 'clear'
