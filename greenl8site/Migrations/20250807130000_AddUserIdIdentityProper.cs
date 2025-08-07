using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace greenl8site.Migrations
{
    public partial class AddUserIdIdentityProper : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // No-op: The Users.Id column already has an identity in production.
            // This migration only updates the EF model snapshot to correctly
            // reflect that the column is an Identity column so that future
            // inserts use DEFAULT instead of NULL.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op: keep the identity configuration.
        }
    }
} 