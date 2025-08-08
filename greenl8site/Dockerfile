# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy source code
COPY . ./

# Build the Angular client first
WORKDIR /app/greenl8web-client
RUN apt-get update && apt-get install -y nodejs npm
RUN npm install
RUN npm run build -- --configuration production

# Build the .NET application
WORKDIR /app
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy the published application
COPY --from=build /app/out .

# Copy the built Angular app browser output to wwwroot (for SSR builds)
COPY --from=build /app/greenl8web-client/dist/greenl8web-client/browser ./wwwroot

# Create uploads directory
RUN mkdir -p wwwroot/uploads

# Expose port
EXPOSE 8080

# Set the ASP.NET Core port
ENV ASPNETCORE_URLS=http://+:8080

# Run the application
ENTRYPOINT ["dotnet", "greenl8site.dll"] 