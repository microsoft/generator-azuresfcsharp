namespace <%= actorName %>Client
{
    using System;
    using Microsoft.ServiceFabric.Actors;
    using Microsoft.ServiceFabric.Actors.Client;
    using <%= actorInterfaceNamespace %>;

    class Program
    {
        static void Main(string[] args)
        {
            var <%= actorName %>TestClient = ActorProxy.Create<<%= actorInterfaceName %>>(new ActorId(0x100), "fabric:/<%= appName %>" , "<%= serviceName %>");
            int result = <%= actorName %>TestClient.GetCountAsync().Result;
            <%= actorName %>TestClient.SetCountAsync(result + 1).Wait();
            Console.WriteLine("Value = {0}", result);
        }
    }
}
