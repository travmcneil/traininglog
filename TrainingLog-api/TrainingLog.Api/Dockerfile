# ---- Build stage ----
# FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy all project files (from parent directory structure)
COPY TrainingLog.Api/TrainingLog.Api.csproj TrainingLog.Api/
COPY TrainingLog.Domain/TrainingLog.Domain.csproj TrainingLog.Domain/
COPY TrainingLog.Infrastructure/TrainingLog.Infrastructure.csproj TrainingLog.Infrastructure/

RUN dotnet restore "TrainingLog.Api/TrainingLog.Api.csproj" --disable-parallel

# Copy all source code
COPY TrainingLog.Api TrainingLog.Api
COPY TrainingLog.Domain TrainingLog.Domain
COPY TrainingLog.Infrastructure TrainingLog.Infrastructure

# Build and publish
WORKDIR /src/TrainingLog.Api
RUN dotnet publish "TrainingLog.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false -m:1

# ---- Final runtime stage ----
# FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TrainingLog.Api.dll"]

