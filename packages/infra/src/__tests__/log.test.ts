import {
  StructuredLogger,
  LogLevel,
  logger,
  createContextLogger,
} from '../log';

// Mock functions
const logDebug = jest.fn();
const logInfo = jest.fn();
const logWarn = jest.fn();
const logError = jest.fn();
const createProjectContext = jest.fn();
const createDealContext = jest.fn();
const createWhatsAppContext = jest.fn();
const createUserContext = jest.fn();

// Mock console methods
const mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation();
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('StructuredLogger', () => {
  let testLogger: StructuredLogger;

  beforeEach(() => {
    testLogger = new StructuredLogger('DEBUG' as any);
    jest.clearAllMocks();
  });

  describe('log level filtering', () => {
    it('should log debug messages when min level is DEBUG', () => {
      testLogger.debug('test message', 'test_event' as any);
      expect(mockConsoleDebug).toHaveBeenCalled();
    });

    it('should not log debug messages when min level is INFO', () => {
      (testLogger as any).setMinLevel('INFO' as any);
      testLogger.debug('test message', 'test_event' as any);
      expect(mockConsoleDebug).not.toHaveBeenCalled();
    });

    it('should log info messages when min level is INFO', () => {
      (testLogger as any).setMinLevel('INFO' as any);
      testLogger.info('test message', 'test_event' as any);
      expect(mockConsoleInfo).toHaveBeenCalled();
    });

    it('should log warn messages when min level is WARN', () => {
      (testLogger as any).setMinLevel('WARN' as any);
      testLogger.warn('test message', 'test_event' as any);
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should log error messages when min level is ERROR', () => {
      (testLogger as any).setMinLevel('ERROR' as any);
      testLogger.error('test message', 'test_event' as any);
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('log message formatting', () => {
    it('should format log messages with timestamp and level', () => {
      testLogger.info('test message', 'test_event' as any);

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO \[test_event\]: test message$/
        )
      );
    });

    it('should include context in log message', () => {
      const context: any = { projectId: 'proj123', userId: 'user456' };
      (testLogger as any).info('test message', 'test_event' as any, context);

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringMatching(/test message {"projectId":"proj123","userId":"user456"}$/)
      );
    });

    it('should handle empty context', () => {
      (testLogger as any).info('test message', 'test_event' as any, {});

      expect(mockConsoleInfo).toHaveBeenCalledWith(expect.stringMatching(/test message$/));
    });
  });

  describe('error logging', () => {
    it('should log error details when error object is provided', () => {
      const error = new Error('Test error');
      (testLogger as any).error('test message', 'test_event' as any, {} as any, error as any);

      expect(mockConsoleError).toHaveBeenCalledTimes(2);
      expect(mockConsoleError).toHaveBeenNthCalledWith(1, expect.stringContaining('test message'));
      expect(mockConsoleError).toHaveBeenNthCalledWith(2, 'Error details:', error as any);
    });
  });

  describe('min level management', () => {
    it('should get and set min level correctly', () => {
      expect((testLogger as any).getMinLevel()).toBe('DEBUG' as any);

      (testLogger as any).setMinLevel('WARN' as any);
      expect((testLogger as any).getMinLevel()).toBe('WARN' as any);
    });
  });
});

describe('convenience functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call logger debug method', () => {
    // Set logger to DEBUG level to ensure debug messages are logged
    (logger as any).setMinLevel('DEBUG' as any);
    logDebug('debug message', 'debug_event');
    expect(mockConsoleDebug).toHaveBeenCalled();
  });

  it('should call logger info method', () => {
    logInfo('info message', 'info_event');
    expect(mockConsoleInfo).toHaveBeenCalled();
  });

  it('should call logger warn method', () => {
    logWarn('warn message', 'warn_event');
    expect(mockConsoleWarn).toHaveBeenCalled();
  });

  it('should call logger error method', () => {
    logError('error message', 'error_event');
    expect(mockConsoleError).toHaveBeenCalled();
  });
});

describe('context creators', () => {
  it('should create project context correctly', () => {
    const context = createProjectContext('proj123', { userId: 'user456' });

    expect(context).toEqual({
      projectId: 'proj123',
      userId: 'user456',
    });
  });

  it('should create deal context correctly', () => {
    const context = createDealContext('deal123', 'proj456', { waSender: 'wa789' });

    expect(context).toEqual({
      dealId: 'deal123',
      projectId: 'proj456',
      waSender: 'wa789',
    });
  });

  it('should create deal context without project ID', () => {
    const context = createDealContext('deal123');

    expect(context).toEqual({
      dealId: 'deal123',
      projectId: undefined,
    });
  });

  it('should create WhatsApp context correctly', () => {
    const context = createWhatsAppContext('wa123', { operationId: 'op456' });

    expect(context).toEqual({
      waSender: 'wa123',
      operationId: 'op456',
    });
  });

  it('should create user context correctly', () => {
    const context = createUserContext('user123', { duration: 500 });

    expect(context).toEqual({
      userId: 'user123',
      duration: 500,
    });
  });
});

describe('singleton logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use the singleton logger instance', () => {
    expect(logger).toBeInstanceOf(StructuredLogger);
  });

  it('should have INFO as default min level', () => {
    // Reset logger to default state
    const freshLogger = new StructuredLogger();
    expect((freshLogger as any).getMinLevel()).toBe('INFO' as any);
  });
});
