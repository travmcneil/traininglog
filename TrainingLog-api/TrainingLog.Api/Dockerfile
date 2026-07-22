# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# 1. Copy the project files first to restore dependencies
COPY TrainingLog.Api/TrainingLog.Api.csproj TrainingLog.Api/
COPY TrainingLog.Infrastructure/TrainingLog.Infrastructure.csproj TrainingLog.Infrastructure/
RUN dotnet restore "TrainingLog.Api/TrainingLog.Api.csproj"

# 2. Copy the rest of the source code
COPY TrainingLog.Api/ TrainingLog.Api/
COPY TrainingLog.Infrastructure/ TrainingLog.Infrastructure/

# 3. Build the application
WORKDIR "/src/TrainingLog.Api"
RUN dotnet build "TrainingLog.Api.csproj" -c Release -o /app/build
# ---- Final runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TrainingLog.Api.dll"]




