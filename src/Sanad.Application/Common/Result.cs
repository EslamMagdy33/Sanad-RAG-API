namespace Sanad.Application.Common;

public class Result
{
    public bool IsSuccess { get; }
    public Error? Error { get; }
    protected Result(bool isSuccess,Error? error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success()=> new(true, null);
    public static Result Failure(Error error)=> new(false,error);

    public override string ToString()=> IsSuccess ? "Success" : $"Failure : [{Error!.Code}] {Error.Message}";
    public static implicit operator Result(Error error)=> Failure(error);
}
public sealed class Result<T> : Result
{
    private readonly T? _value;
    private Result(T? value,bool isSuccess,Error? error):base(isSuccess,error)=>
        _value = value;

    public T? Value => IsSuccess ? _value! : throw new InvalidOperationException("لا يمكن قراءة Value من Result فاشل");
    public static Result<T> Success(T value) => new(value, true, null);
    public static new Result<T> Failure(Error error) => new(default, false, error);

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);
}