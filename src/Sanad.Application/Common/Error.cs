namespace Sanad.Application.Common;

public enum ErrorType{ Validation, NotFound, Conflict, Unauthorized }
public sealed record Error(string Code, string Message, ErrorType Type);
