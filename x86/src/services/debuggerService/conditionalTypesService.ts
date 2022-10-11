import Breakpoint from '../interfaces/debugger/Breakpoint';
import Watchpoint from '../interfaces/debugger/Watchpoint';

export const isBreakpoint = (maybeBreakpoint: Breakpoint | Watchpoint): maybeBreakpoint is Breakpoint => 'line' in maybeBreakpoint;

export const isWatchpoint = (maybeWatchpoint: Breakpoint | Watchpoint): maybeWatchpoint is Watchpoint => !('line' in maybeWatchpoint);
