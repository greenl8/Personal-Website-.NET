using Microsoft.AspNetCore.Mvc;

namespace HelloWorldApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
           return Ok(new { message = "Hello World!" });
        }
    }
}