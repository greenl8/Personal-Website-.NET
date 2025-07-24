using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace greenl8site.Migrations
{
    /// <inheritdoc />
    public partial class AddVideoEmbedCodeAndExcerptToPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Excerpt",
                table: "Posts",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VideoEmbedCode",
                table: "Posts",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Excerpt",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "VideoEmbedCode",
                table: "Posts");
        }
    }
}
