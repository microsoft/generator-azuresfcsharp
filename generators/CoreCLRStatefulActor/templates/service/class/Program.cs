namespace <%= actorName  %>
{
    using System;
    using System.Diagnostics;
    using System.Diagnostics.Tracing;
    using System.Fabric;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.ServiceFabric.Actors.Runtime;

    internal static class Program
    {
        /// <summary>
        /// This is the entry point of the service host process.
        /// </summary>
        private static void Main()
        {
            try
            {
                //Creating a new event listener to redirect the traces to a file
                ActorEventListener listener = new ActorEventListener();
                listener.EnableEvents(ActorEventSource.Current, EventLevel.LogAlways, EventKeywords.All);

                ActorEventSource.Current.Message("Registering Actor : {0}", "<%= actorName %>");

                ActorRuntime.RegisterActorAsync<<%= actorName %>>(
                   (context, actorType) => new ActorService(context, actorType)).GetAwaiter().GetResult();

                ActorEventSource.Current.Message("Registered Actor : {0}", "<%= actorName %>");

                Thread.Sleep(Timeout.Infinite);
            }
            catch (Exception ex)
            {
                ActorEventSource.Current.ActorHostInitializationFailed(ex.ToString());
                throw;
            }
        }
    }
}
