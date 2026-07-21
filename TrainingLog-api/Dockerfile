# ---- Build stage ----
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy csproj files first and restore (leverages Docker layer caching —
# dependencies only re-download if a .csproj actually changes)
COPY ["TrainingLog.Api/TrainingLog.Api.csproj", "TrainingLog.Api/"]
COPY ["TrainingLog.Domain/TrainingLog.Domain.csproj", "TrainingLog.Domain/"]
COPY ["TrainingLog.Infrastructure/TrainingLog.Infrastructure.csproj", "TrainingLog.Infrastructure/"]
RUN dotnet restore "TrainingLog.Api/TrainingLog.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR /src/TrainingLog.Api
RUN dotnet build "TrainingLog.Api.csproj" -c Release -o /app/build

# ---- Publish stage ----
# FROM build AS publish
# RUN dotnet publish "TrainingLog.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---- Final runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
EXPOSE 8080

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TrainingLog.Api.dll"]
